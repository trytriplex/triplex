/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("trigger command palette", async ({ vsce }) => {
  await vsce.codelens("Plane").click();

  await vsce.page.keyboard.press("ControlOrMeta+Shift+P");

  await expect(
    vsce.page.getByPlaceholder("Type the name of a command"),
  ).toBeFocused();
});

test("trigger command palette inside frame", async ({ vsce }) => {
  await vsce.codelens("Plane").click();

  // We trigger the event with dispatch event to ensure the iframe is the event origin.
  // If we don't Playwright fires the event in the parent frame or all frames. Unsure which.
  await vsce.loadedComponent.dispatchEvent("keydown", {
    altKey: false,
    code: "KeyP",
    ctrlKey: process.platform === "win32",
    isComposing: false,
    key: "p",
    keyCode: 80,
    location: 0,
    metaKey: process.platform !== "win32",
    repeat: false,
    shiftKey: true,
  });

  await expect(
    vsce.page.getByPlaceholder("Type the name of a command"),
  ).toBeFocused();
});

test("trigger transform mode change inside frame", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const panel = vsce.resolveEditor();

  // We trigger the event with dispatch event to ensure the iframe is the event origin.
  // If we don't Playwright fires the event in the parent frame or all frames. Unsure which.
  await vsce.loadedComponent.dispatchEvent("keydown", {
    altKey: false,
    code: "KeyR",
    ctrlKey: false,
    isComposing: false,
    key: "r",
    keyCode: 82,
    location: 0,
    metaKey: false,
    repeat: false,
    shiftKey: false,
  });

  await expect(
    panel.locator.getByRole("button", { name: "Rotate" }),
  ).toHaveAccessibleName("Rotate active");
});
