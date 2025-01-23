/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("provider controls default values", async ({ electron }) => {
  const panel = electron.contextPanel;
  await expect(panel.input("Barbar").locator).toHaveValue("1");
  await expect(panel.input("Batbat").locator).toHaveValue("100");
  await expect(panel.input("Bazbaz").locator).toHaveValue("jelly");
  await expect(panel.input("Foofoo").locator).toBeChecked();
});

test("provider controls set and clear back to default value", async ({
  electron,
}) => {
  const panel = electron.contextPanel;
  await panel.input("Barbar").locator.selectOption("foo");
  await expect(panel.input("Barbar").locator).toHaveValue("0");

  await panel.input("Barbar").locator.press("Backspace");

  await expect(panel.input("Barbar").locator).toHaveValue("1");
});

test("component controls default values", async ({ electron }) => {
  await electron.propControls.openButton.click();
  const panel = electron.contextPanel;

  await expect(panel.input("Value").locator).toHaveValue("100");
  await expect(panel.input("Variant").locator).toHaveValue("0");
  await expect(panel.input("Name").locator).toHaveValue("jelly");
  await expect(panel.input("Visible").locator).toBeChecked();
});

test("component controls set and clear back to default value", async ({
  electron,
}) => {
  await electron.propControls.openButton.click();
  const input = electron.contextPanel.input("Variant").locator;
  await input.selectOption("small");
  await expect(input).toHaveValue("1");

  await input.press("Backspace");

  await expect(input).toHaveValue("0");
});

test("component props default values", async ({ electron }) => {
  const panel = electron.contextPanel;
  await electron.scenePanel.elementButton("Box").click();

  await expect(panel.input("Color").locator).toHaveValue("2");
  await expect(panel.input("Size").locator).toHaveValue("1");
});

test("component props set and clear back to default value", async ({
  electron,
}) => {
  await electron.scenePanel.elementButton("Box").click();
  const input = electron.contextPanel.input("Color").locator;
  await input.selectOption("green");
  await expect(input).toHaveValue("1");

  await input.press("Backspace");

  await expect(input).toHaveValue("2");
});
