/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.tsx",
      fileName: "index",
      formats: ["es"],
    },
    minify: true,
    outDir: "dist",
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
    },
  },
  plugins: [glsl()],
});
