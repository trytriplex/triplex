/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("play mode defaults to default camera", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const panel = vsce.resolveEditor();

  await panel.locator
    .getByRole("button", { exact: true, name: "Play" })
    .click();

  await expect(panel.devOnlyCameraPanel).toHaveText(/type: user/);
  await expect(panel.devOnlyCameraPanel).toHaveText(/name: user_defined/);
});
