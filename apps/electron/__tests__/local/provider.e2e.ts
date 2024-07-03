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
  test("provider controls show set up CTA", async ({ electron }) => {
    await expect(electron.contextPanel.locator).toHaveText(
      /Set up a provider component/,
    );
  });
});
