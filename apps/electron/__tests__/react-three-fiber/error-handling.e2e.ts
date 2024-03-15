/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("render error", async ({ editorR3F }) => {
  await editorR3F.waitForScene();
  await editorR3F.openFileButton.click();

  await editorR3F.fileDrawer.thumbnail("Render Error").click();

  await expect(editorR3F.errorOverlay.locator).toBeVisible();
});

test("syntax error", async ({ editorR3F }) => {
  await editorR3F.waitForScene();
  await editorR3F.openFileButton.click();

  await editorR3F.fileDrawer.thumbnail("Syntax Error").click();

  await expect(editorR3F.errorOverlay.locator).toBeVisible();
});

test.describe(() => {
  test.use({
    file: {
      exportName: "UnsafeRefAccess",
      path: "src/unsafe-ref.tsx",
    },
  });

  test("unsafe ref access should not throw", async ({ editorR3F }) => {
    await editorR3F.waitForScene();

    await expect(editorR3F.errorOverlay.locator).toBeHidden();
  });
});
