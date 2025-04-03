/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

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
      external: [
        "@react-three/fiber",
        "@react-three/xr",
        "react-dom",
        "react-dom/client",
        "react",
        "react/compiler-runtime",
        "react/jsx-dev-runtime",
        "react/jsx-runtime",
        "three",
      ],
    },
  },
  plugins: [glsl()],
});
