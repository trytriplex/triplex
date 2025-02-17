/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
      inverse: "var(--bg-inverse)",
      neutral: "var(--bg-neutral)",
      pressed: "var(--bg-pressed)",
      selected: "var(--bg-selected)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    borderColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      focus: "var(--text-selected)",
      inverse: "var(--bg-inverse)",
      link: "var(--text-link)",
      neutral: "var(--border)",
      selected: "var(--text-selected)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    fontFamily: {
      brand: ["var(--suse)"],
      default: ["var(--karla)"],
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
    },
    outlineColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      focus: "var(--text-selected)",
      inverse: "var(--bg-inverse)",
      link: "var(--text-link)",
      neutral: "var(--border)",
      selected: "var(--text-selected)",
      surface: "var(--bg-surface)",
      transparent: "transparent",
    },
    textColor: {
      brand: "var(--brand)",
      currentColor: "currentColor",
      default: "var(--text)",
      inverse: "var(--text-inverse)",
      "inverse-subtle": "var(--text-inverse-subtle)",
      link: "var(--text-link)",
      selected: "var(--text-selected)",
      subtle: "var(--text-subtle)",
      subtlest: "var(--text-subtlest)",
      transparent: "transparent",
    },
  },
};
