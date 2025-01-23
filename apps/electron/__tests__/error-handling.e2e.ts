/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("render error", async ({ electron }) => {
  await electron.openFileButton.click();

  await electron.fileDrawer.thumbnail("Render Error").click();

  await expect(electron.errorOverlay.locator).toBeVisible();
});

test("syntax error", async ({ electron }) => {
  await electron.openFileButton.click();

  await electron.fileDrawer.thumbnail("Syntax Error").click();

  await expect(electron.errorOverlay.locator).toBeVisible();
});

test.describe(() => {
  test.use({
    file: {
      exportName: "UnsafeRefAccess",
      path: "src/unsafe-ref.tsx",
    },
  });

  test("unsafe ref access should not throw", async ({ electron }) => {
    await expect(electron.errorOverlay.locator).toBeHidden();
  });
});
