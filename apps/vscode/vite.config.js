/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { builtinModules } from "node:module";
import react from "@vitejs/plugin-react";
import { resolve } from "upath";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig(({ mode }) => {
  if (mode === "vsce") {
    const externalConfig = [
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
      ...Object.keys(pkg.dependencies),
      "vscode",
    ];

    return {
      build: {
        emptyOutDir: false,
        outDir: "out/dist",
        rollupOptions: {
          external: externalConfig,
          input: {
            extension: resolve(__dirname, "src/extension/index.ts"),
            project: resolve(__dirname, "src/project/index.ts"),
          },
          output: {
            assetFileNames: "assets/[name].[ext]",
            chunkFileNames: "assets/[name].js",
            entryFileNames: "[name].js",
            format: "cjs",
          },
        },
        ssr: true,
        ssrEmitAssets: true,
        target: "node18",
      },
      define: {
        "process.env.NODE_ENV": process.env.SMOKE_TEST
          ? '"staging"'
          : '"production"',
      },
      mode: "production",
      ssr: {
        external: externalConfig,
        noExternal: true,
      },
    };
  } else if (mode === "app") {
    return {
      base: "/__base_url_replace__",
      build: {
        emptyOutDir: false,
        outDir: "out/dist",
        rollupOptions: {
          input: {
            index: resolve(__dirname, "index.html"),
          },
          output: {
            assetFileNames: "assets/[name].[ext]",
            chunkFileNames: "assets/[name].js",
            entryFileNames: "[name].js",
          },
        },
      },
      define: {
        "process.env.NODE_ENV": process.env.SMOKE_TEST
          ? '"staging"'
          : '"production"',
      },
      mode: "production",
      plugins: [
        react({
          babel: {
            plugins: [
              [
                "babel-plugin-react-compiler",
                {
                  // When we don't support React 18 anymore this can be bumped to 19.
                  target: "18",
                },
              ],
            ],
          },
        }),
      ],
    };
  }

  throw new Error(`invariant: unknown --mode "${mode}"`);
});
