/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("thumbnail loads", async ({ editorLocal }) => {
  const drawer = await editorLocal.assetsDrawer.open();
  await drawer.openFolder({ name: "files" });

  const thumbnail = editorLocal.page.getByTestId("Thumbnail(Button)");

  await expect(thumbnail).toHaveJSProperty("complete", true);
  await expect(thumbnail).not.toHaveJSProperty("naturalWidth", 0);
});
