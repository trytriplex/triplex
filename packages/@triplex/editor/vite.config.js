/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
              target: "18",
            },
          ],
        ],
      },
    }),
  ],
};
