/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { builtinModules } from "node:module";
import { resolve } from "upath";
import { defineConfig } from "vite";
import pkg from "./package.json";

const externalConfig = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...Object.keys(pkg.dependencies),
  "vscode",
];

export default defineConfig({
  base: "/__base_url_replace__",
  build: {
    minify: false,
    outDir: "out/dist",
    rollupOptions: {
      external: externalConfig,
      input: {
        extension: resolve(__dirname, "src/extension/index.ts"),
        index: resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: "assets/[name].[ext]",
        chunkFileNames: "assets/[name].js",
        entryFileNames: "[name].js",
        inlineDynamicImports: false,
      },
    },
    ssr: true,
    ssrEmitAssets: true,
    target: "node18",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  mode: "production",
  ssr: {
    external: externalConfig,
    format: "cjs",
    noExternal: true,
  },
});
