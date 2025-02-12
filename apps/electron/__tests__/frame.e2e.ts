/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

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
