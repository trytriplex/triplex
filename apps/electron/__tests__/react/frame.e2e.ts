/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("default activated frame", async ({ editorReact }) => {
  await expect(editorReact.frame.expandButton).toBeAttached();
  await expect(editorReact.frame.activateButton).not.toBeAttached();
});

test("de-activating frame", async ({ editorReact }) => {
  await editorReact.frame.deactivateButton.click();

  await expect(editorReact.frame.expandButton).not.toBeAttached();
  await expect(editorReact.frame.activateButton).toBeAttached();
});

test("expand frame", async ({ editorReact }) => {
  await editorReact.frame.expandButton.click();

  await expect(editorReact.frame.locator).toHaveClass(/h-full w-full/);
});

test("collapse frame", async ({ editorReact }) => {
  await editorReact.frame.expandButton.click();

  await editorReact.frame.collapseButton.click();

  await expect(editorReact.frame.locator).not.toHaveClass(/h-full w-full/);
});
