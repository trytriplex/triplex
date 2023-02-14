// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, "../editor/src/**/*.{js,ts,jsx,tsx}")],
  theme: {
    fontFamily: {
      sans: ["Karla", "sans-serif"],
    },
  },
  plugins: [],
};
