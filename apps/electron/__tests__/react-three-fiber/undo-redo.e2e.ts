/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("undo an action", async ({ electron }) => {
  await electron.scenePanel.elementButton("Box").click();
  await electron.contextPanel.input("Position").locator.fill("2");
  await electron.keyboard.press("Enter");
  await expect(
    electron.fileTabs.tab("scene.tsx").unsavedIndicator,
  ).toBeVisible();
  await electron.contextPanel.waitForInputValue("number", "2");

  await electron.undo();

  await expect(
    electron.fileTabs.tab("scene.tsx").unsavedIndicator,
  ).toBeHidden();
});

test("redo an action", async ({ electron }) => {
  await electron.scenePanel.elementButton("Box").click();
  await electron.contextPanel.input("Position").locator.fill("2");
  await electron.keyboard.press("Enter");
  await expect(
    electron.fileTabs.tab("scene.tsx").unsavedIndicator,
  ).toBeVisible();
  await electron.contextPanel.waitForInputValue("number", "2");
  await electron.undo();
  await expect(
    electron.fileTabs.tab("scene.tsx").unsavedIndicator,
  ).toBeHidden();

  await electron.redo();

  await expect(
    electron.fileTabs.tab("scene.tsx").unsavedIndicator,
  ).toBeVisible();
});
