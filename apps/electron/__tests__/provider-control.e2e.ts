/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
