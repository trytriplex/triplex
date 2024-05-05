/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { test as base } from "@playwright/test";
import { _electron as electron } from "playwright";
import { join } from "upath";
import { resolveExecPath, runUseWithTrace } from "../../../../test/playwright";
import { ExtensionPage } from "./po";

async function launch() {
  const logs: string[] = [];
  const app = await electron.launch({
    args: [
      join(process.cwd(), "examples/test-fixture"),
      join(process.cwd(), "examples/test-fixture/src/scene.tsx"),
      process.env.CI ? "--headless" : "",
      // Args found from https://github.com/microsoft/playwright/issues/22351
      "--disable-gpu-sandbox", // https://github.com/microsoft/vscode-test/issues/221
      "--disable-updates", // https://github.com/microsoft/vscode-test/issues/120
      "--disable-workspace-trust",
      "--disable-extensions",
      "--extensionDevelopmentPath=" + join(__dirname, "..", ".."),
      "--new-window", // Opens a new session of VS Code instead of restoring the previous session (default).
      "--no-sandbox", // https://github.com/microsoft/vscode/issues/84238
      "--profile-temp", // "debug in a clean environment"
      "--skip-release-notes",
      "--skip-welcome",
    ],
    env: {
      ...process.env,
      VITE_TRIPLEX_ENV: "test",
    },
    executablePath: await resolveExecPath(),
  });

  const window = await app.firstWindow();

  app
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  app
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString())
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
    const { app, logs, window } = await launch();
    const page = new ExtensionPage(window);

    await runUseWithTrace({ logs, page, testInfo, use });

    await window.close();
    await app.close();
  },
});

export { test };
