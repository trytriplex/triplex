/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("focusing an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();

  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await expect(
    editor.panels.getByRole("button", { name: "ambientLight selected" }),
  ).toBeVisible();
});

test("blurring an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();
  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await vsce.page.keyboard.press("Escape");

  await expect(
    editor.panels.getByRole("button", { exact: true, name: "ambientLight" }),
  ).toBeVisible();
});

test("default component switcher to initially opened component", async ({
  vsce,
}) => {
  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");
  const editor = vsce.resolveEditor();

  await editor.togglePanelsButton.click();

  await expect(editor.panels.getByTestId("ElementSelect")).toHaveValue("Scene");
});
