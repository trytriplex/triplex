/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("create new file and insert a box", async ({ electron }) => {
  await electron.newFile();
  const globalDrawer = await electron.assetsDrawer.open();
  await globalDrawer.openFolder("built-in");
  await globalDrawer.addAsset("Mesh");
  await electron.waitForElementCount(4);

  const localDrawer = await electron.assetsDrawer.open("mesh", 2);
  await localDrawer.openFolder("built-in");
  await localDrawer.addAsset("Sphere Geometry");

  await expect(electron.contextPanel.heading).toHaveText("sphereGeometry");
  const button = await electron.scenePanel.elementButton("mesh", 1);
  const childButton = button.childElementButton("sphereGeometry").locator;
  await expect(childButton).toBeVisible();
});

test("create new component and insert a box", async ({ electron }) => {
  await electron.scenePanel.newComponent();
  const drawer = await electron.assetsDrawer.open();
  await drawer.openFolder("built-in");
  await drawer.addAsset("Mesh");

  await electron.assetsDrawer.open("mesh", 2);
  await drawer.openFolder("built-in");
  await drawer.addAsset("Sphere Geometry");

  await expect(electron.contextPanel.heading).toHaveText("sphereGeometry");
  const button = await electron.scenePanel.elementButton("mesh", 1);
  const childButton = button.childElementButton("sphereGeometry").locator;
  await expect(childButton).toBeVisible();
});

test("create new file and insert a custom component", async ({ electron }) => {
  await electron.newFile();
  const drawer = await electron.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await electron.scenePanel.elementButton("Box");

  await expect(electron.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});

test("create new component and insert a custom component", async ({
  electron,
}) => {
  await electron.scenePanel.newComponent();
  const drawer = await electron.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await electron.scenePanel.elementButton("Box");

  await expect(electron.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});
