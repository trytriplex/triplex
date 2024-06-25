/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("renderer starts", async ({ editorLocal }) => {
  await expect(editorLocal.scenePanel.heading).toHaveText("Button");
  await expect(
    editorLocal.scenePanel.elementButton("button").locator,
  ).toBeVisible();
});
