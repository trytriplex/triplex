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
  await expect(vsce.loadedComponent).toHaveText("Scene");
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();
  const splitter = editor.locator.getByTestId("panel-drag-handle");

  const initialStyle = await editor.panels.getAttribute("style");

  await splitter.dragTo(editor.locator.getByRole("button", { name: "Select" }));

  await expect(editor.panels).not.toHaveAttribute("style", initialStyle || "");
});
