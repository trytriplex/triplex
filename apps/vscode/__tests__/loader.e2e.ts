/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default to perspective camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  const panel = vsce.resolvePanel();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: perspective/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: __triplex_camera/);
});

test("opening scene using codelens", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  await expect(vsce.loadedComponent).toHaveText("Scene");
});

test.skip("opening another scene using codelens", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");

  await vsce.codelens("Plane").click();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});
