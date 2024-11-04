/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("delete child element", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("meshStandardMaterial");

  await child.deleteButton.click();

  await expect(child.locator).toBeHidden();
});

test("delete parent element", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");

  await parent.deleteButton.click();

  await expect(parent.locator).toBeHidden();
});

test("enter camera", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton(
    "user_defined (PerspectiveCamera)",
  );
  await electron.waitForScene();

  await parent.customAction("Enter Camera").click();

  await expect(parent.customAction("Exit Camera")).toBeVisible();
});

test("enter camera block changing host camera", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton(
    "user_defined (PerspectiveCamera)",
  );
  await electron.waitForScene();

  await parent.customAction("Enter Camera").click();
  await electron.controls.button("Switch To Orthographic").click();

  await expect(
    electron.controls.button("Switch To Orthographic"),
  ).toBeVisible();
  await expect(electron.controls.button("Switch To Perspective")).toBeHidden();
});

test("focus parent element", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");

  await parent.click();

  await expect(electron.contextPanel.heading).toHaveText("Box");
});

test("focus child element", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");
  await electron.waitForScene();
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("hello-world");

  await child.locator.click();

  await expect(electron.contextPanel.heading).toHaveText("mesh");
});

test("enter custom element and back", async ({ electron }) => {
  const element = electron.scenePanel.elementButton("Box");
  await element.click();
  await expect(electron.contextPanel.heading).toHaveText("Box");

  await element.dblclick();
  await expect(electron.scenePanel.heading).toHaveText("Box");
  await electron.scenePanel.exitSelectionButton.click();

  await expect(electron.scenePanel.heading).toHaveText("Scene");
});

test("elements from node modules cant be entered", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton(
    "user_defined (PerspectiveCamera)",
  );

  await parent.dblclick();

  await expect(electron.scenePanel.heading).toHaveText("Scene");
});
