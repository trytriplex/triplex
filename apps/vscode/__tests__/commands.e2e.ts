/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("fill number input", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  await expect(vsce.loadedComponent).toHaveText("Plane");
  const { panels, togglePanelsButton } = vsce.resolveEditor();
  await togglePanelsButton.click();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  const input = panels.getByLabel("width", { exact: true });

  await input.fill("0.5");
  await input.press("Enter");

  await expect(input).toHaveValue("0.5");
});

test("delete element", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  await expect(vsce.loadedComponent).toHaveText("Plane");
  const { panels, togglePanelsButton } = vsce.resolveEditor();
  await togglePanelsButton.click();
  await panels.getByRole("button", { name: "planeGeometry" }).click();

  await vsce.page.keyboard.press("Backspace");

  await expect(panels).not.toContainText("planeGeometry");
});

test("backspacing in an input does not delete the element", async ({
  vsce,
}) => {
  await vsce.codelens("Plane").click();
  await expect(vsce.loadedComponent).toHaveText("Plane");
  const { panels, togglePanelsButton } = vsce.resolveEditor();
  await togglePanelsButton.click();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  const input = panels.getByLabel("width", { exact: true });
  await input.fill("0.5");

  // Delay the press so there is enough time to see a deletion if a regression occurs.
  await input.press("Backspace", { delay: 500 });

  await expect(panels).toContainText("planeGeometry");
});
