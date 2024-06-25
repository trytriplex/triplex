/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/* eslint-disable no-console */
/* eslint-disable no-empty-pattern */
import { test as _test } from "@playwright/test";
import { _electron as electron } from "playwright";
import { join } from "upath";
import { runUseWithTrace } from "../../../../test/playwright";
import { defer } from "../../src/util/promise";
import { EditorPage } from "./po";

async function launch(
  textFixturePath: string,
  opts: {
    exportName: string;
    path: string;
  },
) {
  const logs: string[] = [];
  const app = await electron.launch({
    args: [
      join(__dirname, "../..", "hook-main.js"),
      process.env.CI ? "--headless" : "",
    ],
    cwd: join(__dirname, "../.."),
    env: {
      ...process.env,
      FORCE_EDITOR_TEST_FIXTURE: join(process.cwd(), textFixturePath),
      FORCE_EXPORT_NAME: opts.exportName,
      FORCE_PATH: opts.path,
      VITE_TRIPLEX_ENV: "test",
    },
  });

  app
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  app
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString()),
    );

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // NOTE: During the test run we skip the welcome window.
  // Look for "FORCE_EDITOR_TEST_FIXTURE" env var.
  const window = await app.firstWindow();
  const sceneReadyPromise = defer();

  await window.exposeFunction("sceneReady", () => {
    sceneReadyPromise.resolve();
  });

  await window.addInitScript(() => {
    globalThis.window.addEventListener("message", (e) => {
      if (e.data.eventName === "component-rendered") {
        // @ts-expect-error
        window.sceneReady();
      }
    });
  });

  window.on("console", (msg) => {
    logs.push(`[renderer:${msg.type()}] ${msg.text()}`);
  });

  window.on("pageerror", (msg) => {
    logs.push("[renderer:error] " + msg.name + " " + msg.message);
  });

  return {
    app,
    logs,
    sceneReadyPromise: sceneReadyPromise.promise,
    window,
  };
}

const test = _test.extend<{
  /** Starts the custom local renderer for Triplex. */
  editorLocal: EditorPage;
  /** Starts the React Three Fiber renderer for Triplex. */
  editorR3F: EditorPage;
  /** Starts the React renderer for Triplex. */
  editorReact: EditorPage;
  /** First file to open for the test. */
  file: { exportName: string; path: string };
}>({
  editorLocal: async ({ file }, use, testInfo) => {
    const { app, logs, sceneReadyPromise, window } = await launch(
      "examples-private/custom-renderer",
      file,
    );
    const page = new EditorPage(window, sceneReadyPromise, testInfo);

    await runUseWithTrace({ logs, page, testInfo, use });

    app.process().kill();
    await app.close();
  },
  editorR3F: async ({ file }, use, testInfo) => {
    const { app, logs, sceneReadyPromise, window } = await launch(
      "examples/test-fixture",
      file,
    );
    const page = new EditorPage(window, sceneReadyPromise, testInfo);

    await runUseWithTrace({ logs, page, testInfo, use });

    app.process().kill();
    await app.close();
  },
  editorReact: async ({ file }, use, testInfo) => {
    const { app, logs, sceneReadyPromise, window } = await launch(
      "examples-private/react-dom",
      file,
    );
    const page = new EditorPage(window, sceneReadyPromise, testInfo);

    await runUseWithTrace({ logs, page, testInfo, use });

    app.process().kill();
    await app.close();
  },
  file: [{ exportName: "", path: "" }, { option: true }],
});

export { test };
