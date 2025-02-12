/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

// TODO: Test is flakey think up a better way to test / implement.
test.fixme("thumbnail loads", async ({ electron }) => {
  const drawer = await electron.assetsDrawer.open();
  await drawer.openFolder({ name: "geometry" });

  const thumbnail = electron.page.getByTestId("Thumbnail(Box)");

  await expect(thumbnail).toHaveJSProperty("complete", true);
  await expect(thumbnail).not.toHaveJSProperty("naturalWidth", 0);
});
