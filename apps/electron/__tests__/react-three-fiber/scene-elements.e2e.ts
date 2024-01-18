/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("react pp bloom loads props", async ({ editorR3F }) => {
  await editorR3F.scenePanel.elementButton("Bloom").click();

  await expect(editorR3F.contextPanel.heading).toHaveText("Bloom");
});
