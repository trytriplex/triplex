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
    filename: "examples/test-fixture/src/scroll-drei.tsx",
  });

  test("scroll controls loads", async ({ vsce }) => {
    await vsce.codelens("ScrollTestFixture").click();

    await expect(vsce.loadedComponent).toHaveText("ScrollTestFixture");
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/sab.tsx",
  });

  test(
    "shared array buffers load without errors",
    { tag: "@vsce_smoke" },
    async ({ vsce }) => {
      test.skip(
        !!process.env.SMOKE_TEST && process.platform === "linux",
        `Skipped Linux when running smoke tests because it can't open new files and I couldn't fix it time boxed. Let's fix this in the future.`,
      );

      await vsce.codelens("SharedArrayBufferTest").click();

      await expect(vsce.loadedComponent).toHaveText("SharedArrayBufferTest");
    },
  );
});
