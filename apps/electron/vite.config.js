/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { builtinModules } from "node:module";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import pkg from "./package.json";

const externalConfig = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...Object.keys(pkg.dependencies),
  "electron",
  "chokidar",
];

export default defineConfig({
  build: {
    minify: true,
    outDir: "dist",
    rollupOptions: {
      external: externalConfig,
      input: [
        resolve(__dirname, "src/entrypoints/main.ts"),
        resolve(__dirname, "src/entrypoints/preload.js"),
        resolve(__dirname, "src/entrypoints/project.ts"),
      ],
      output: {
        format: "cjs",
      },
    },
    ssr: true,
    target: "node18",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  mode: "production",
  ssr: {
    external: externalConfig,
    noExternal: true,
  },
});
