/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("default to expanded frame", async ({ editorR3F }) => {
  await expect(editorR3F.frame.locator).toHaveClass(/h-full w-full/);
});

test("collapse then expand frame", async ({ editorR3F }) => {
  await editorR3F.frame.collapseButton.click();
  await editorR3F.frame.activateButton.click();

  await editorR3F.frame.expandButton.click();

  await expect(editorR3F.frame.locator).toHaveClass(/h-full w-full/);
});

test("collapse frame", async ({ editorR3F }) => {
  await editorR3F.frame.collapseButton.click();

  await expect(editorR3F.frame.locator).not.toHaveClass(/h-full w-full/);
});
