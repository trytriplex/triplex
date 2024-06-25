/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("delete child element", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("meshStandardMaterial");

  await child.deleteButton.click();

  await expect(child.locator).toBeHidden();
});

test("delete parent element", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("Box");

  await parent.deleteButton.click();

  await expect(parent.locator).toBeHidden();
});

test("enter camera", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("PerspectiveCamera");
  await editorR3F.waitForScene();

  await parent.customAction("Enter Camera").click();

  await expect(parent.customAction("Exit Camera")).toBeVisible();
});

test("enter camera block changing host camera", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("PerspectiveCamera");
  await editorR3F.waitForScene();

  await parent.customAction("Enter Camera").click();
  await editorR3F.controls.button("Switch To Orthographic").click();

  await expect(
    editorR3F.controls.button("Switch To Orthographic"),
  ).toBeVisible();
  await expect(editorR3F.controls.button("Switch To Perspective")).toBeHidden();
});

test("focus parent element", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("Box");

  await parent.click();

  await expect(editorR3F.contextPanel.heading).toHaveText("Box");
});

test("focus child element", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("Box");
  await editorR3F.waitForScene();
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("hello-world");

  await child.locator.click();

  await expect(editorR3F.contextPanel.heading).toHaveText("mesh");
});

test("enter custom element and back", async ({ editorR3F }) => {
  const element = editorR3F.scenePanel.elementButton("Box");
  await element.click();
  await expect(editorR3F.contextPanel.heading).toHaveText("Box");

  await element.dblclick();
  await expect(editorR3F.scenePanel.heading).toHaveText("Box");
  await editorR3F.scenePanel.exitSelectionButton.click();

  await expect(editorR3F.scenePanel.heading).toHaveText("Scene");
});

test("elements from node modules cant be entered", async ({ editorR3F }) => {
  const parent = editorR3F.scenePanel.elementButton("PerspectiveCamera");

  await parent.dblclick();

  await expect(editorR3F.scenePanel.heading).toHaveText("Scene");
});
