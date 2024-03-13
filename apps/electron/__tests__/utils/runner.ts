/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/* eslint-disable no-console */
/* eslint-disable no-empty-pattern */
import { test as _test, type TestInfo } from "@playwright/test";
import { _electron as electron } from "playwright";
import { defer } from "../../src/util/promise";
import { EditorPage } from "./po";

async function launch(
  textFixturePath: string,
  opts: {
    exportName: string;
    path: string;
  }
) {
  const logs: string[] = [];
  const electronApp = await electron.launch({
    args: ["hook-main.js", process.env.CI ? "--headless" : ""],
    env: {
      ...process.env,
      FORCE_EDITOR_TEST_FIXTURE: textFixturePath,
      FORCE_EXPORT_NAME: opts.exportName,
      FORCE_PATH: opts.path,
      VITE_TRIPLEX_ENV: "test",
    },
  });

  electronApp
    .process()
    .stdout!.on("data", (msg) => logs.push("[main:log] " + msg.toString()));

  electronApp
    .process()
    .stderr!.on("data", (error) =>
      logs.push("[main:error] " + error.toString())
    );

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // NOTE: During the test run we skip the welcome window.
  // Look for "FORCE_EDITOR_TEST_FIXTURE" env var.
  const editorWindow = await electronApp.firstWindow();
  const sceneReadyPromise = defer();

  await editorWindow.exposeFunction("sceneReady", () => {
    sceneReadyPromise.resolve();
  });

  await editorWindow.addInitScript(() => {
    window.addEventListener("message", (e) => {
      if (e.data.eventName === "component-rendered") {
        // @ts-expect-error
        window.sceneReady();
      }
    });
  });

  editorWindow.on("console", (msg) => {
    logs.push(`[renderer:${msg.type()}] ${msg.text()}`);
  });

  editorWindow.on("pageerror", (msg) => {
    logs.push("[renderer:error] " + msg.name + " " + msg.message);
  });

  return {
    editorWindow,
    electronApp,
    logs,
    sceneReadyPromise: sceneReadyPromise.promise,
  };
}

async function runUseWithTrace({
  editorPage,
  logs,
  testInfo,
  use,
}: {
  editorPage: EditorPage;
  logs: string[];
  testInfo: TestInfo;
  use: (r: EditorPage) => Promise<void>;
}) {
  const context = editorPage.page.context();

  if (testInfo.retry) {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
    });
  }

  await use(editorPage);

  await testInfo.attach("logs", {
    body: logs.join("\n"),
    contentType: "text/plain",
  });

  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await editorPage.screenshot();
    await testInfo.attach("screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  }

  if (testInfo.retry) {
    const saveTrace =
      testInfo.status !== testInfo.expectedStatus
        ? testInfo.outputPath("trace.zip")
        : undefined;

    await context.tracing.stop({
      path: saveTrace,
    });

    if (saveTrace) {
      await testInfo.attach("trace", {
        contentType: "application/zip",
        path: saveTrace,
      });
    }
  }
}

const test = _test.extend<{
  /**
   * Starts the custom local renderer for Triplex.
   */
  editorLocal: EditorPage;
  /**
   * Starts the React Three Fiber renderer for Triplex.
   */
  editorR3F: EditorPage;
  /**
   * Starts the React renderer for Triplex.
   */
  editorReact: EditorPage;
  /**
   * First file to open for the test.
   */
  file: { exportName: string; path: string };
}>({
  editorLocal: async ({ file }, use, testInfo) => {
    const { editorWindow, electronApp, logs, sceneReadyPromise } = await launch(
      "examples-private/custom-renderer",
      file
    );
    const editorPage = new EditorPage(
      editorWindow,
      sceneReadyPromise,
      testInfo
    );

    await runUseWithTrace({ editorPage, logs, testInfo, use });

    await electronApp.close();
  },

  editorR3F: async ({ file }, use, testInfo) => {
    const { editorWindow, electronApp, logs, sceneReadyPromise } = await launch(
      "examples/test-fixture",
      file
    );
    const editorPage = new EditorPage(
      editorWindow,
      sceneReadyPromise,
      testInfo
    );

    await runUseWithTrace({ editorPage, logs, testInfo, use });

    await electronApp.close();
  },
  editorReact: async ({ file }, use, testInfo) => {
    const { editorWindow, electronApp, logs, sceneReadyPromise } = await launch(
      "examples-private/react-dom",
      file
    );
    const editorPage = new EditorPage(
      editorWindow,
      sceneReadyPromise,
      testInfo
    );

    await runUseWithTrace({ editorPage, logs, testInfo, use });

    await electronApp.close();
  },
  file: [{ exportName: "", path: "" }, { option: true }],
});

export { test };
