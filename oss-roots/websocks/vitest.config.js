/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  return {
    test: {
      expect: {
        requireAssertions: true,
      },
      setupFiles: "./test/setup.ts",
    },
  };
});
