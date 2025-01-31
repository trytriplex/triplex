/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("play mode defaults to default camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

test("switch to play mode and back", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await panel.locator
    .getByRole("button", { exact: true, name: "Stop" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: __triplex_camera/);
});

test("switch to play mode and toggle to editor camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();
  await expect(panel.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await panel.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Editor Camera");

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: __triplex_camera/);
});

test("toggle to editor camera and switch to play mode", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();
  await panel.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Editor Camera");
  await expect(panel.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: __triplex_camera/);

  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: __triplex_camera/);
});
