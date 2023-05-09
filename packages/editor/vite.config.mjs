import react from "@vitejs/plugin-react";

/**
 * @type {import("vite").UserConfig}
 */
export default {
  base: "./",
  define: {
    __TRIPLEX_TARGET__: `"${process.env.TRIPLEX_TARGET}"`,
  },
  plugins: [react()],
};
