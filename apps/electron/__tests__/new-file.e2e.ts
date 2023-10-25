/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("create new file and insert a box", async ({ editorPage }) => {
  await editorPage.newFile();

  const drawer = await editorPage.openAssetsDrawer();
  await drawer.openFolder("built-in");
  await drawer.addAsset("Mesh");

  await editorPage.openAssetsDrawer({ column: 5, line: 5, name: "mesh" });
  await drawer.openFolder("built-in");
  await drawer.addAsset("Box Geometry");

  const button = await editorPage.sceneElementButton({
    column: 11,
    line: 5,
    name: "boxGeometry",
  });

  await expect(button).toHaveText("boxGeometry");
});
