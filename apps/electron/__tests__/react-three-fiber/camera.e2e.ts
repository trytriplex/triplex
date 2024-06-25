/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("default to perspective camera", async ({ editorR3F }) => {
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to orthographic camera and back", async ({ editorR3F }) => {
  await editorR3F.waitForScene();

  await editorR3F.controls.button("Switch To Orthographic").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: orthographic/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await editorR3F.controls.button("Switch To Perspective").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to play mode and back", async ({ editorR3F }) => {
  await editorR3F.waitForScene();

  await editorR3F.controls.button("Play Scene").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await editorR3F.controls.button("Stop Scene").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );
});

test("switch to play mode and toggle to default camera", async ({
  editorR3F,
}) => {
  await editorR3F.waitForScene();

  await editorR3F.controls.button("Play Scene").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await editorR3F.controls.button("Play Options").click();
  await editorR3F.page.getByText("Default camera").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

test("toggle to default camera and switch to play mode", async ({
  editorR3F,
}) => {
  await editorR3F.waitForScene();

  await editorR3F.controls.button("Play Options").click();
  await editorR3F.page.getByText("Default camera").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(
    /name: __triplex_camera/,
  );

  await editorR3F.controls.button("Play Scene").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});

// This is currently a bug where the camera isn't unset when removing it as default
// This could be a bug in Triplex or R3F. Need to investigate.
test.skip("unset userland camera to use default camera in play mode", async ({
  editorR3F,
}) => {
  await editorR3F.waitForScene();
  const parent = editorR3F.scenePanel.elementButton("PerspectiveCamera");
  await parent.click();
  const input = editorR3F.contextPanel.input("Make Default").locator;

  await input.uncheck();
  await editorR3F.controls.button("Play Scene").click();

  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/name: \(empty\)/);
  await expect(editorR3F.devOnlyCameraPanel).toHaveText(/type: user/);
});
