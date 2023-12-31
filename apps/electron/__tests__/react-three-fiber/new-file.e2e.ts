/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("create new file and insert a box", async ({ editorR3F }) => {
  await editorR3F.newFile();
  const globalDrawer = await editorR3F.assetsDrawer.open();
  await globalDrawer.openFolder("built-in");
  await globalDrawer.addAsset("Mesh");
  await editorR3F.waitForElementCount(4);

  const localDrawer = await editorR3F.assetsDrawer.open("mesh", 2);
  await localDrawer.openFolder("built-in");
  await localDrawer.addAsset("Sphere Geometry");

  await expect(editorR3F.contextPanel.heading).toHaveText("sphereGeometry");
  const button = await editorR3F.scenePanel.elementButton("mesh", 1);
  const childButton = button.childElementButton("sphereGeometry").locator;
  await expect(childButton).toBeVisible();
});

test("create new component and insert a box", async ({ editorR3F }) => {
  await editorR3F.scenePanel.newComponent();
  const drawer = await editorR3F.assetsDrawer.open();
  await drawer.openFolder("built-in");
  await drawer.addAsset("Mesh");

  await editorR3F.assetsDrawer.open("mesh", 2);
  await drawer.openFolder("built-in");
  await drawer.addAsset("Sphere Geometry");

  await expect(editorR3F.contextPanel.heading).toHaveText("sphereGeometry");
  const button = await editorR3F.scenePanel.elementButton("mesh", 1);
  const childButton = button.childElementButton("sphereGeometry").locator;
  await expect(childButton).toBeVisible();
});

test("create new file and insert a custom component", async ({ editorR3F }) => {
  await editorR3F.newFile();
  const drawer = await editorR3F.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await editorR3F.scenePanel.elementButton("Box");

  await expect(editorR3F.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});

test("create new component and insert a custom component", async ({
  editorR3F,
}) => {
  await editorR3F.scenePanel.newComponent();
  const drawer = await editorR3F.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await editorR3F.scenePanel.elementButton("Box");

  await expect(editorR3F.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});
