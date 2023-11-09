/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("create new file and insert a box", async ({ editor }) => {
  await editor.newFile();
  const drawer = await editor.assetsDrawer.open();
  await drawer.openFolder("built-in");
  await drawer.addAsset("Mesh");

  await editor.assetsDrawer.open("mesh");
  await drawer.openFolder("built-in");
  await drawer.addAsset("Box Geometry");

  const button = await editor.scenePanel.elementButton("boxGeometry");
  await expect(editor.contextPanel.heading).toHaveText("boxGeometry");
  await expect(button.locator).toHaveText("boxGeometry");
});

test("create new component and insert a box", async ({ editor }) => {
  await editor.scenePanel.newComponent();
  const drawer = await editor.assetsDrawer.open();
  await drawer.openFolder("built-in");
  await drawer.addAsset("Mesh");

  await editor.assetsDrawer.open("mesh");
  await drawer.openFolder("built-in");
  await drawer.addAsset("Box Geometry");

  const button = await editor.scenePanel.elementButton("boxGeometry");
  await expect(editor.contextPanel.heading).toHaveText("boxGeometry");
  await expect(button.locator).toHaveText("boxGeometry");
});

test("create new file and insert a custom component", async ({ editor }) => {
  await editor.newFile();
  const drawer = await editor.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await editor.scenePanel.elementButton("Box");

  await expect(editor.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});

test("create new component and insert a custom component", async ({
  editor,
}) => {
  await editor.scenePanel.newComponent();
  const drawer = await editor.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });
  await drawer.addAsset("Box");

  const button = await editor.scenePanel.elementButton("Box");

  await expect(editor.contextPanel.heading).toHaveText("Box");
  await expect(button.locator).toHaveText("Box");
});
