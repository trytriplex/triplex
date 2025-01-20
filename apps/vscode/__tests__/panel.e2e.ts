/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("resizing the scene panel", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  const splitter = editor.locator.getByTestId("panel-drag-handle");

  const initialStyle = await editor.panels.getAttribute("style");

  await splitter.dragTo(editor.locator.getByRole("button", { name: "Select" }));

  await expect(editor.panels).not.toHaveAttribute("style", initialStyle || "");
});

test.describe(() => {
  test.use({
    filename: "examples-private/test-fixture/src/controls.tsx",
  });

  test("component controls updates prop value", async ({ vsce }) => {
    await vsce.codelens("ComponentControlsTest").click();
    const { componentControlsButtons, panels, scene } = vsce.resolveEditor();
    await componentControlsButtons.open.click();
    const input = panels.getByLabel("color", { exact: true });

    await input.selectOption("green");

    const element = scene.locator.getByTestId("component-props");
    await expect(element).toContainText(`"color":"green"`);
  });
});
