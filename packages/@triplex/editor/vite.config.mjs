/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

/**
 * @type {import("vite").UserConfig}
 */
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
  define: {},
  plugins: [react()],
};
