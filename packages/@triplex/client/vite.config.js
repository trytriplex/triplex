/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { builtinModules } from "node:module";
import { resolve } from "upath";
import { defineConfig } from "vite";
import pkg from "./package.json";

const externalConfig = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...Object.keys(pkg.dependencies),
];

/**
 * NOTE: This is only for the dev build. For the actual vite config that affects
 * the scene frame check {@link ./src/index.ts}.
 */
export default defineConfig({
  build: {
    minify: true,
    outDir: "dist",
    rollupOptions: {
      external: externalConfig,
      output: {
        format: "cjs",
        inlineDynamicImports: true,
      },
    },
    ssr: resolve(__dirname, "src/index.ts"),
    target: "node18",
  },
  ssr: {
    external: externalConfig,
    noExternal: true,
  },
});
