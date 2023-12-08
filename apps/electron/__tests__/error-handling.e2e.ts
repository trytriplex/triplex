/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("render error", async ({ editor }) => {
  await editor.waitForScene();
  await editor.fileTabs.openFileButton.click();

  await editor.fileDrawer.fileLink("RenderError").click();

  await expect(editor.errorOverlay.locator).toBeVisible();
});

test("syntax error", async ({ editor }) => {
  await editor.waitForScene();
  await editor.fileTabs.openFileButton.click();

  await editor.fileDrawer.fileLink("SyntaxError").click();

  await expect(editor.errorOverlay.locator).toBeVisible();
});
