/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
    ctrlKey: process.platform !== "darwin",
    isComposing: false,
    key: "p",
    keyCode: 80,
    location: 0,
    metaKey: process.platform === "darwin",
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
