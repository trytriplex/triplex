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
    filename: "examples/edge-cases/src/define.tsx",
  });

  test("custom vite config loads", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { scene } = vsce.resolveEditor();

    await expect(scene.locator.getByText("it is false!")).toBeVisible();
  });
});
