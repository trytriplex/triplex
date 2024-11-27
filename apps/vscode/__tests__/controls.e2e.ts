/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default to pointer", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  const panel = vsce.resolveEditor();

  await expect(
    panel.locator.getByRole("button", { name: "Select" }),
  ).toHaveAccessibleName("Select active");
});

test("switch to scale via click", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator.getByRole("button", { name: "Scale" }).click();

  await expect(
    panel.locator.getByRole("button", { name: "Scale" }),
  ).toHaveAccessibleName("Scale active");
});

test("switch to rotate via hotkey", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator.getByRole("button", { name: "Scale" }).press("r");

  await expect(
    panel.locator.getByRole("button", { name: "Rotate" }),
  ).toHaveAccessibleName("Rotate active");
});

test("lights set on load", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await expect(
    panel.locator.getByRole("button", { name: "Turn On Default Lights" }),
  ).toBeVisible();
  await expect(
    panel.scene.locator.getByTestId("scene-lights-off"),
  ).toBeVisible();
});

test("lights turned on", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator
    .getByRole("button", { name: "Turn On Default Lights" })
    .click();

  await expect(
    panel.scene.locator.getByTestId("scene-lights-on"),
  ).toBeVisible();
});
