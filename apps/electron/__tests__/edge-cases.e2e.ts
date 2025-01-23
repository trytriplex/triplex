/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
