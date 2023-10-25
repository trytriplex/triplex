/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/* eslint-disable no-console */
/* eslint-disable no-empty-pattern */
import { test as _test } from "@playwright/test";
import { _electron as electron, ElectronApplication, Page } from "playwright";
import { EditorPage } from "./po";

let editorWindow: Page;
let electronApp: ElectronApplication;

_test.beforeAll(async ({}, testInfo) => {
  testInfo.slow();

  electronApp = await electron.launch({
    args: ["hook-main.js"],
    env: {
      ...process.env,
      FORCE_EDITOR_TEST_FIXTURE: "true",
      TRIPLEX_TARGET: "electron",
      VITE_TEST: "true",
    },
  });

  electronApp
    .process()
    .stdout?.on("data", (data) => console.log(`main: ${data.toString()}`));
  electronApp
    .process()
    .stderr?.on("data", (error) => console.error(`main: ${error.toString()}`));

  // During the test run we skip the welcome window.
  // Look for "FORCE_EDITOR_TEST_FIXTURE" env var.
  editorWindow = await electronApp.firstWindow();

  editorWindow.on("console", (msg) => {
    console.log("renderer:", msg);
  });

  await editorWindow.waitForSelector(`[data-testid="titlebar"]`);
});

_test.afterEach(async () => {
  await editorWindow.reload();
});

const test = _test.extend<{
  editorPage: EditorPage;
  screenshotOnFailure: void;
}>({
  editorPage: async ({}, use) => {
    const todoPage = new EditorPage(editorWindow);
    await use(todoPage);
  },
  screenshotOnFailure: [
    async ({}, use, testInfo) => {
      await use();

      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshot = await editorWindow.screenshot();
        await testInfo.attach("screenshot", {
          body: screenshot,
          contentType: "image/png",
        });
      }
    },
    { auto: true },
  ],
});

export { test };
