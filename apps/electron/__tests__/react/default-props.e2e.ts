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

  test("provider controls default values", async ({ electron }) => {
    const panel = electron.contextPanel;
    await expect(panel.input("Bar").locator).toHaveValue("1");
    await expect(panel.input("Bat").locator).toHaveValue("100");
    await expect(panel.input("Baz").locator).toHaveValue("jelly");
    await expect(panel.input("Foo").locator).toBeChecked();
  });

  test("provider controls set and clear back to default value", async ({
    electron,
  }) => {
    const panel = electron.contextPanel;
    await panel.input("Bar").locator.selectOption("foo");
    await expect(panel.input("Bar").locator).toHaveValue("0");

    await panel.input("Bar").locator.press("Backspace");

    await expect(panel.input("Bar").locator).toHaveValue("1");
  });
});
