/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("default to expanded frame", async ({ electron }) => {
  await expect(electron.frame.locator).toHaveClass(/h-full w-full/);
});

test("collapse then expand frame", async ({ electron }) => {
  await electron.frame.collapseButton.click();

  await electron.frame.expandButton.click();

  await expect(electron.frame.locator).toHaveClass(/h-full w-full/);
});

test("collapse frame", async ({ electron }) => {
  await electron.frame.collapseButton.click();

  await expect(electron.frame.locator).not.toHaveClass(/h-full w-full/);
});
