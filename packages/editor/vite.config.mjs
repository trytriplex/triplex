import react from "@vitejs/plugin-react";
import { resolve } from "path";

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base: "./",
  define: {
    __TRIPLEX_TARGET__: `"${process.env.TRIPLEX_TARGET}"`,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        editor: resolve(__dirname, "index.html"),
        welcome: resolve(__dirname, "welcome.html"),
      },
    },
  },
};
