/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("update component position prop", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("Box");
  await parent.click();
  const input = editor.contextPanel.input("Position");

  await input.fill("2");
  await editor.keyboard.press("Enter");

  const tab = editor.fileTabs.tab("scene.tsx");
  await expect(tab.unsavedIndicator).toBeVisible();
});

test("update child component name prop", async ({ editor }) => {
  await editor.waitForScene();
  const parent = editor.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = editor.scenePanel.elementButton("boxGeometry");
  await child.click();
  const input = editor.contextPanel.input("Name");

  await input.fill("foo");
  await editor.keyboard.press("Enter");

  await expect(child.locator).toHaveText("foo (boxGeometry)");
});
