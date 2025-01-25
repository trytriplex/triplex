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
    filename: "examples-private/test-fixture/src/controls.tsx",
  });

  test(
    "hmr is flushed when changing component props",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );
      await vsce.codelens("TestHMR").click();
      const { panels, scene } = vsce.resolveEditor();
      await panels
        .getByRole("button", { name: "ComponentControlsTest" })
        .click();

      await panels.getByLabel("color", { exact: true }).selectOption("green");

      const element = scene.locator.getByTestId("component-props");
      await expect(element).toContainText(`"color":"green"`);
    },
  );
});
