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
    filename: "examples-private/test-fixture/src/names.tsx",
  });

  test("host element with a name", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { panels } = vsce.resolveEditor();

    await expect(panels.getByRole("button", { name: "plane1" })).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples-private/test-fixture/src/names.tsx",
  });

  test("custom element with a name", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { panels } = vsce.resolveEditor();

    await expect(panels.getByRole("button", { name: "box1" })).toBeVisible();
  });
});
