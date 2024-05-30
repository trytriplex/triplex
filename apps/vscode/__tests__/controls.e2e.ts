/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default to translate", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  const panel = vsce.resolvePanel();

  await expect(
    panel.locator.getByRole("button", { name: "Translate" })
  ).toHaveAccessibleName("Translate active");
});

test("switch to scale via click", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolvePanel();

  await panel.locator.getByRole("button", { name: "Scale" }).click();

  await expect(
    panel.locator.getByRole("button", { name: "Scale" })
  ).toHaveAccessibleName("Scale active");
});

test("switch to rotate via hotkey", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolvePanel();

  await panel.locator.getByRole("button", { name: "Scale" }).press("r");

  await expect(
    panel.locator.getByRole("button", { name: "Rotate" })
  ).toHaveAccessibleName("Rotate active");
});
