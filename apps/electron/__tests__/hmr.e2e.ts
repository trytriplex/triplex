/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe(() => {
  test.use({
    file: {
      exportName: "TestHMR",
      path: "src/controls.tsx",
    },
  });

  test(
    "hmr is flushed when changing component props",
    { tag: "@electron_smoke" },
    async ({ electron }) => {
      await electron.scenePanel.elementButton("ComponentControlsTest").click();

      await electron.contextPanel.input("Color").locator.selectOption("green");

      const element = electron.scene.getByTestId("component-props");
      await expect(element).toContainText(`"color":"green"`);
    },
  );
});
