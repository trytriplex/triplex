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
    file: {
      exportName: "SharedArrayBufferTest",
      path: "src/sab.tsx",
    },
  });

  test(
    "shared array buffers load without errors",
    { tag: "@electron_smoke" },
    async ({ electron }) => {
      await expect(electron.loadedComponent).toHaveText(
        "SharedArrayBufferTest",
      );
    },
  );
});
