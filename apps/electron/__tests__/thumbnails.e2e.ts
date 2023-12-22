/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("thumbnail loads", async ({ editor }) => {
  const drawer = await editor.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });

  const thumbnail = editor.page.getByTestId("Thumbnail(Box)");

  await expect(thumbnail).toHaveJSProperty("complete", true);
  await expect(thumbnail).not.toHaveJSProperty("naturalWidth", 0);
});
