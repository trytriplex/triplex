/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("update component position prop", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");
  await parent.click();
  const input = electron.contextPanel.input("Position").locator;

  await input.fill("2");
  await electron.keyboard.press("Enter");

  const tab = electron.fileTabs.tab("scene.tsx");
  await expect(tab.unsavedIndicator).toBeVisible();
});

test("update child component name prop", async ({ electron }) => {
  const parent = electron.scenePanel.elementButton("Box");
  await parent.expandButton.click({ force: true });
  const child = parent.childElementButton("boxGeometry");
  await child.click();
  const input = electron.contextPanel.input("Name").locator;

  await input.fill("foo");
  await electron.keyboard.press("Enter");

  await expect(child.locator).toHaveText("foo (boxGeometry)");
  await expect(electron.fileTabs.tab("box.tsx").unsavedIndicator).toBeVisible();
});

// TODO: Test is flakey need to investigate why it fails.
test.fixme(
  "insert element to component with no fragment",
  async ({ electron }) => {
    await electron.openFileButton.click();
    await electron.fileDrawer.thumbnail("No Fragment").click();

    const drawer = await electron.assetsDrawer.open();
    await drawer.openFolder({ name: "geometry" });
    await drawer.addAsset("Box");

    const button = await electron.scenePanel.elementButton("Box");
    await button.click();
    await expect(electron.contextPanel.heading).toHaveText("Box");
    await expect(button.locator).toHaveText("Box");
  },
);
