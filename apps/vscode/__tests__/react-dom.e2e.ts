/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe(() => {
  test.use({
    filename: "examples-private/react-only/src/app.tsx",
  });

  test("resizing the scene panel", async ({ vsce }) => {
    await vsce.codelens("ReactOnly").click();

    await expect(vsce.loadedComponent).toHaveText("ReactOnly");
  });
});
