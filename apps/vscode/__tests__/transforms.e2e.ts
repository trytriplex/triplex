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
    filename: "examples-private/test-fixture/src/transforms.tsx",
  });

  test("translating a custom component", async ({ vsce }) => {
    await vsce.codelens("TranslateCustomComponent").click();
    const { locator, panels, scene } = await vsce.resolveEditor();

    await panels.getByRole("button", { name: "Transformable" }).click();
    await locator.getByRole("button", { name: "Translate" }).click();
    await scene.locator.getByText("Test Translation").click();

    await expect(panels.getByPlaceholder("x")).toHaveValue("1");
    await expect(panels.getByPlaceholder("y")).toHaveValue("1");
    await expect(panels.getByPlaceholder("z")).toHaveValue("1");
  });
});
