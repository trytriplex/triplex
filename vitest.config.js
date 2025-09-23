/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const { default: glsl } = await import("vite-plugin-glsl");

  return {
    plugins: [glsl()],
    test: {
      dangerouslyIgnoreUnhandledErrors: true,
      expect: {
        requireAssertions: true,
      },
      setupFiles: "./test/setup.ts",
    },
  };
});
