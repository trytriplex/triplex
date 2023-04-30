// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path");

/**
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  content: [join(__dirname, "../editor/src/**/*.tsx")],
  theme: {
    fontFamily: {
      sans: [
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Noto Sans",
        "Ubuntu",
        "Cantarell",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
  },
  plugins: [],
};
