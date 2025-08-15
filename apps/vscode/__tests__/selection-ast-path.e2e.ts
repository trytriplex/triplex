/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { overrideFg, test } from "./utils/runner";

overrideFg("selection_ast_path", true);

test("focus custom component displays props", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();

  await editor.scene.click();

  await expect(
    editor.panels.getByRole("button", { name: "Box selected" }),
  ).toBeVisible();
  await expect(editor.panels.getByLabel("position")).toBeVisible();
});
