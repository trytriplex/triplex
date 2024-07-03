/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test.describe(() => {
  test.use({
    file: {
      exportName: "StickerSheetButton",
      path: "src/sheets.tsx",
      project: "examples-private/react-dom",
    },
  });

  test("renderer starts", async ({ electron }) => {
    await expect(electron.scenePanel.heading).toHaveText("StickerSheetButton");
    await expect(
      electron.scenePanel.elementButton("button").locator,
    ).toBeVisible();
  });
});
