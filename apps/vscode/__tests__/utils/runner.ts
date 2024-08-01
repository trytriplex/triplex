/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { spawnSync } from "node:child_process";
import { test as base, type Electron, type TestInfo } from "@playwright/test";
import { resolveCliArgsFromVSCodeExecutablePath } from "@vscode/test-electron";
import pkg from "package.json";
import { _electron as electron } from "playwright";
import { join } from "upath";
import { resolveExecPath, runUseWithTrace } from "../../../../test/playwright";
import { ExtensionPage } from "./po";

async function tryInstallBundledExtension() {
  const executablePath = await resolveExecPath();
  const [cli, ...args] =
    await resolveCliArgsFromVSCodeExecutablePath(executablePath);

  spawnSync(
    cli,
    [
      ...args,
      "--install-extension",
      join(__dirname, "..", "..", "out", `${pkg.name}-${pkg.version}.vsix`),
    ],
    {
      encoding: "utf8",
      // "shell: true" is needed so this works on Windows otherwise it fails silently.
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );
}

const launchElectronWithRetry = async (
  opts: Parameters<Electron["launch"]>[0],
  retries = 2,
): ReturnType<Electron["launch"]> => {
  try {
    return await electron.launch(opts);
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    const nextMs = (1 / retries) * 2000;

    // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
    console.log((error as any).error);
    // eslint-disable-next-line no-console
    console.log(
      `Failed to launch electron, retrying ${retries} times in ${nextMs}ms...`,
    );

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, nextMs),
    );

    return launchElectronWithRetry(opts, retries - 1);
  }
};

async function launch(testInfo: TestInfo) {
  const isSmokeTest =
    process.env.SMOKE_TEST && testInfo.tags.includes("@vsce_smoke");

  if (isSmokeTest) {
    await tryInstallBundledExtension();
  }

  const logs: string[] = [];
  const executablePath = await resolveExecPath();
  const [, ...args] =
    await resolveCliArgsFromVSCodeExecutablePath(executablePath);
  const app = await launchElectronWithRetry({
    args: [
      ...args,
      join(process.cwd(), "examples/test-fixture"),
      join(process.cwd(), "examples/test-fixture/src/scene.tsx"),
      process.env.CI ? "--headless" : "",
      // Args found from https://github.com/microsoft/playwright/issues/22351
      "--disable-gpu-sandbox", // https://github.com/microsoft/vscode-test/issues/221
      "--disable-updates", // https://github.com/microsoft/vscode-test/issues/120
      "--disable-workspace-trust",
      ...(isSmokeTest
        ? []
        : [
            "--disable-extensions",
            "--profile-temp", // "debug in a clean environment",
            "--extensionDevelopmentPath=" + join(__dirname, "..", ".."),
          ]),
      "--new-window", // Opens a new session of VS Code instead of restoring the previous session (default).
      "--no-sandbox", // https://github.com/microsoft/vscode/issues/84238
      "--skip-welcome",
      "--skip-release-notes",
      "--use-gl=egl",
    ],
    env: {
      ...process.env,
      VITE_TRIPLEX_ENV: "test",
    },
    executablePath,
  });

  const window = await app.firstWindow();

  app
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  app
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString()),
    );

  window.on("console", (msg) => {
    logs.push(`[renderer:${msg.type()}] ${msg.text()}`);
  });

  window.on("pageerror", (msg) => {
    logs.push("[renderer:error] " + msg.name + " " + msg.message);
  });

  return {
    app,
    logs,
    window,
  };
}

const test = base.extend<{
  vsce: ExtensionPage;
}>({
  vsce: async ({}, use, testInfo) => {
    const { app, logs, window } = await launch(testInfo);
    const page = new ExtensionPage(window);

    await runUseWithTrace({ logs, page, testInfo, use });

    app.process().kill();
    await app.close();
  },
});

export { test };
