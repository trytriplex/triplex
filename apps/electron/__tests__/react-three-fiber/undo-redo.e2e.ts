/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("undo an action", async ({ editorR3F }) => {
  await editorR3F.scenePanel.elementButton("Box").click();
  await editorR3F.contextPanel.input("Position").locator.fill("2");
  await editorR3F.keyboard.press("Enter");
  await expect(
    editorR3F.fileTabs.tab("scene.tsx").unsavedIndicator
  ).toBeVisible();
  await editorR3F.contextPanel.waitForInputValue("number", "2");

  await editorR3F.undo();

  await expect(
    editorR3F.fileTabs.tab("scene.tsx").unsavedIndicator
  ).toBeHidden();
});

test("redo an action", async ({ editorR3F }) => {
  await editorR3F.scenePanel.elementButton("Box").click();
  await editorR3F.contextPanel.input("Position").locator.fill("2");
  await editorR3F.keyboard.press("Enter");
  await expect(
    editorR3F.fileTabs.tab("scene.tsx").unsavedIndicator
  ).toBeVisible();
  await editorR3F.contextPanel.waitForInputValue("number", "2");
  await editorR3F.undo();
  await expect(
    editorR3F.fileTabs.tab("scene.tsx").unsavedIndicator
  ).toBeHidden();

  await editorR3F.redo();

  await expect(
    editorR3F.fileTabs.tab("scene.tsx").unsavedIndicator
  ).toBeVisible();
});
