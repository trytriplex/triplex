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
      exportName: "Button",
      path: "src/files/button.tsx",
      project: "examples-private/custom-renderer",
    },
  });

  test("thumbnail loads", async ({ electron }) => {
    const drawer = await electron.assetsDrawer.open();
    await drawer.openFolder({ name: "files" });

    const thumbnail = electron.page.getByTestId("Thumbnail(Button)");

    await expect(thumbnail).toHaveJSProperty("complete", true);
    await expect(thumbnail).not.toHaveJSProperty("naturalWidth", 0);
  });
});
