/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("update component position prop", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("Box");
  await parent.click();
  const input = editorR3F.contextPanel.input("Position");

  await input.fill("2");
  await editorR3F.keyboard.press("Enter");

  const tab = editorR3F.fileTabs.tab("scene.tsx");
  await expect(tab.unsavedIndicator).toBeVisible();
});

test("update child component name prop", async ({ editorR3F }) => {
  await editorR3F.waitForScene();
  const parent = editorR3F.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("boxGeometry");
  await child.click();
  const input = editorR3F.contextPanel.input("Name");

  await input.fill("foo");
  await editorR3F.keyboard.press("Enter");

  await expect(child.locator).toHaveText("foo (boxGeometry)");
  await expect(
    editorR3F.fileTabs.tab("box.tsx").unsavedIndicator
  ).toBeVisible();
});
