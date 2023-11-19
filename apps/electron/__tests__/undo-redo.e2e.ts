/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("undo an action", async ({ editor }) => {
  await editor.scenePanel.elementButton("Box").click();
  await editor.contextPanel.input("Position").fill("2");
  await editor.keyboard.press("Enter");
  await expect(editor.fileTabs.tab("scene.tsx").unsavedIndicator).toBeVisible();
  await editor.contextPanel.waitForInputValue("number", "2");

  await editor.undo();

  await expect(editor.fileTabs.tab("scene.tsx").unsavedIndicator).toBeHidden();
});

test("redo an action", async ({ editor }) => {
  await editor.scenePanel.elementButton("Box").click();
  await editor.contextPanel.input("Position").fill("2");
  await editor.keyboard.press("Enter");
  await expect(editor.fileTabs.tab("scene.tsx").unsavedIndicator).toBeVisible();
  await editor.contextPanel.waitForInputValue("number", "2");
  await editor.undo();
  await expect(editor.fileTabs.tab("scene.tsx").unsavedIndicator).toBeHidden();

  await editor.redo();

  await expect(editor.fileTabs.tab("scene.tsx").unsavedIndicator).toBeVisible();
});
