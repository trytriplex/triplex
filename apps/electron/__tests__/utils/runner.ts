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
import { EditorPage } from "./po";

function defer() {
  let resolve!: () => void;
  let reject!: () => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

async function launch() {
  const electronApp = await electron.launch({
    args: ["hook-main.js", process.env.CI ? "--headless" : ""],
    env: {
      ...process.env,
      FORCE_EDITOR_TEST_FIXTURE: "true",
      TRIPLEX_TARGET: "electron",
    },
  });

  electronApp
    .process()
    .stderr?.on("data", (error) =>
      console.error(`[main error]: ${error.toString()}`)
    );

  // During the test run we skip the welcome window.
  // Look for "FORCE_EDITOR_TEST_FIXTURE" env var.
  const editorWindow = await electronApp.firstWindow();

  const sceneReadyPromise = defer();

  await editorWindow.exposeFunction("sceneReady", () => {
    sceneReadyPromise.resolve();
  });

  await editorWindow.addInitScript(() => {
    window.addEventListener("message", (e) => {
      if (e.data.eventName === "trplx:onSceneLoaded") {
        // @ts-expect-error
        window.sceneReady();
      }
    });
  });

  editorWindow.on("pageerror", (msg) => {
    console.log("[renderer error]:", msg);
  });

  return {
    editorWindow,
    electronApp,
    sceneReadyPromise: sceneReadyPromise.promise,
  };
}

const test = _test.extend<{
  editor: EditorPage;
  screenshotOnFailure: void;
}>({
  editor: async ({}, use, testInfo) => {
    const { editorWindow, electronApp, sceneReadyPromise } = await launch();
    const editorPage = new EditorPage(
      editorWindow,
      sceneReadyPromise,
      testInfo
    );

    await use(editorPage);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await editorWindow.screenshot();
      await testInfo.attach("screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
    }

    await electronApp.close();
  },
});

export { test };
