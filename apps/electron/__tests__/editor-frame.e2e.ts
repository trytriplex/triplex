/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./runner";

test("editor title bar", async ({ editorPage }) => {
  const actual = await editorPage.titleBar();

  await expect(actual).toHaveText("scene.tsx — test-fixture");
});
