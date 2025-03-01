/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

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
