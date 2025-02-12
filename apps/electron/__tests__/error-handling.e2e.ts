/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
