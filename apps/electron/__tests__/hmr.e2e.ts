/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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

  /**
   * THIS IS A VERY IMPORTANT TEST DO NOT SKIP OR DELETE. IT PROVES TRIPLEX IS
   * WORKING FOR ITS CORE DEV LOOP.
   */
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
