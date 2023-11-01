/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { builtinModules } from "node:module";
import { resolve } from "node:path";
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
        inlineDynamicImports: true,
      },
    },
    ssr: resolve(__dirname, "src/index.ts"),
    target: "node18",
  },
  ssr: {
    external: externalConfig,
    format: "cjs",
    noExternal: true,
  },
});
