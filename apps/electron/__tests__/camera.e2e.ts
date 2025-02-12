/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default to perspective camera", async ({ electron }) => {
  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to orthographic camera and back", async ({ electron }) => {
  await electron.controls.button("Switch To Orthographic").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: orthographic/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await electron.controls.button("Switch To Perspective").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to play mode and back", async ({ electron }) => {
  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(electron.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await electron.controls.button("Stop Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to play mode and toggle to editor camera", async ({
  electron,
}) => {
  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(electron.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await electron.controls.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Editor Camera");

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("toggle to editor camera and switch to play mode", async ({
  electron,
}) => {
  await electron.controls.locator
    .getByRole("combobox", { name: "Settings" })
    .selectOption("Use Editor Camera");

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

// This is currently a bug where the camera isn't unset when removing it as default
// This could be a bug in Triplex or R3F. Need to investigate.
test.skip("unset userland camera to use default camera in play mode", async ({
  electron,
}) => {
  const parent = electron.scenePanel.elementButton(
    "user_defined (PerspectiveCamera)",
  );
  await parent.click();
  const input = electron.contextPanel.input("Make Default").locator;

  await input.uncheck();
  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/name: \(empty\)/);
  await expect(electron.devOnlyCameraPanel).toHaveText(/type: user/);
});
