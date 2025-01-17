/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{tsx,mdx}",
    "./components/**/*.{tsx,mdx}",
    "./nextra-triplex/**/*.{tsx,mdx}",
  ],
  plugins: [],
  theme: {
    backgroundColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      hovered: "var(--bg-hovered)",
      neutral: "var(--bg-neutral)",
      pressed: "var(--bg-pressed)",
      selected: "var(--bg-selected)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    borderColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      link: "var(--text-link)",
      neutral: "var(--border)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    fontFamily: {
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
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
    outlineColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      link: "var(--text-link)",
      neutral: "var(--bg-neutral)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    textColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      default: "var(--text)",
      inverse: "var(--bg-surface)",
      link: "var(--text-link)",
      selected: "var(--text-selected)",
      subtle: "var(--text-subtle)",
      subtlest: "var(--text-subtlest)",
      transparent: "transparent",
    },
  },
};
