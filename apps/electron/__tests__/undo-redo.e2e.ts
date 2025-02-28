/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

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
