/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test.describe(() => {
  test.use({
    file: {
      exportName: "StickerSheetButton",
      path: "src/sheets.tsx",
      project: "examples-private/react-dom",
    },
  });

  test("default activated frame", async ({ electron }) => {
    await expect(electron.frame.expandButton).toBeAttached();
    await expect(electron.frame.activateButton).not.toBeAttached();
  });

  test("de-activating frame", async ({ electron }) => {
    await electron.frame.deactivateButton.click();

    await expect(electron.frame.expandButton).not.toBeAttached();
    await expect(electron.frame.activateButton).toBeAttached();
  });

  test("expand frame", async ({ electron }) => {
    await electron.frame.expandButton.click();

    await expect(electron.frame.locator).toHaveClass(/h-full w-full/);
  });

  test("collapse frame", async ({ electron }) => {
    await electron.frame.expandButton.click();

    await electron.frame.collapseButton.click();

    await expect(electron.frame.locator).not.toHaveClass(/h-full w-full/);
  });
});
