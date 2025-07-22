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
    filename: "examples/edge-cases/src/transforms.tsx",
  });

  test("translating a custom component", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { locator, panels, scene } = await vsce.resolveEditor();

    await panels
      .getByRole("button", { name: "TransformedInsideGroup" })
      .click();
    await locator.getByRole("button", { name: "Translate" }).click();
    await scene.locator.getByText("Test Translation").click();

    await expect(panels.getByPlaceholder("x")).toHaveValue("1");
    await expect(panels.getByPlaceholder("y")).toHaveValue("1");
    await expect(panels.getByPlaceholder("z")).toHaveValue("1");
  });

  test("only mutates onces", async ({ vsce }) => {
    await vsce.codelens("Scene").click();
    const { locator, panels, scene } = await vsce.resolveEditor();
    await panels
      .getByRole("button", { name: "TransformedInsideGroup" })
      .click();
    await locator.getByRole("button", { name: "Translate" }).click();

    await scene.locator.getByText("Test Translation").click();
    await scene.locator.getByText("Test Translation").click();

    // Test Translation sets values to 1
    await expect(panels.getByPlaceholder("x")).toHaveValue("1");
    await expect(panels.getByPlaceholder("y")).toHaveValue("1");
    await expect(panels.getByPlaceholder("z")).toHaveValue("1");

    await vsce.page.keyboard.press("ControlOrMeta+Z");

    await expect(panels.getByPlaceholder("x")).toHaveValue("-1.53");
    await expect(panels.getByPlaceholder("y")).toHaveValue("0.2");
    await expect(panels.getByPlaceholder("z")).toHaveValue("-0.31");
  });
});
