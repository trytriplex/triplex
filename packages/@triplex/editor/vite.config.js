/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import react from "@vitejs/plugin-react";
import { resolve } from "upath";

/** @type {import("vite").UserConfig} */
export default {
  base: "./",
  build: {
    rollupOptions: {
      input: {
        editor: resolve(__dirname, "index.html"),
        error: resolve(__dirname, "fallback-error.html"),
        welcome: resolve(__dirname, "welcome.html"),
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
