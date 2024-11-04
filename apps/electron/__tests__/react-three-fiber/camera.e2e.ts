/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("default to perspective camera", async ({ electron }) => {
  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to orthographic camera and back", async ({ electron }) => {
  await electron.waitForScene();

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
  await electron.waitForScene();

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
  await electron.waitForScene();

  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(electron.devOnlyCameraPanel).toHaveText(/name: user_defined/);

  await electron.controls.button("Play Options").click();
  await electron.page.getByText("Editor Camera").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("toggle to default camera and switch to play mode", async ({
  electron,
}) => {
  await electron.waitForScene();

  await electron.controls.button("Play Options").click();
  await electron.page.getByText("Default Camera").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(electron.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await electron.controls.button("Play Scene").click();

  await expect(electron.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(electron.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

// This is currently a bug where the camera isn't unset when removing it as default
// This could be a bug in Triplex or R3F. Need to investigate.
test.skip("unset userland camera to use default camera in play mode", async ({
  electron,
}) => {
  await electron.waitForScene();
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
