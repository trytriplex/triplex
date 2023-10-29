/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("delete child element", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = editor.scenePanel.elementButton("meshStandardMaterial");

  await child.deleteButton.click();

  await expect(child.locator).toBeHidden();
});

test("delete parent element", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("Box");

  await parent.deleteButton.click();

  await expect(parent.locator).toBeHidden();
});

test("enter camera", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("PerspectiveCamera");
  await editor.waitForScene();

  await parent.enterCameraButton.click();

  await expect(editor.controlsMenu.exitUserCameraButton).toBeAttached();
});

test("focus parent element", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("Box");

  await parent.click();

  await expect(editor.contextPanel.heading).toHaveText("Box");
});

test("focus child element", async ({ editor }) => {
  const parent = editor.scenePanel.elementButton("Box");
  await editor.waitForScene();
  await parent.expandButton.click({ force: true });
  const child = editor.scenePanel.elementButton("hello-world");

  await child.locator.click();

  await expect(editor.contextPanel.heading).toHaveText("mesh");
});
