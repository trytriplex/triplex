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
      brand: "var(--x-brand)",
      currentColor: "currentColor",
      hovered: "var(--x-bg-hovered)",
      inverse: "var(--x-bg-inverse)",
      neutral: "var(--x-bg-neutral)",
      pressed: "var(--x-bg-pressed)",
      selected: "var(--x-bg-selected)",
      surface: "var(--x-bg-surface)",
      transparent: "transparent",
    },
    borderColor: {
      brand: "var(--x-brand)",
      currentColor: "currentColor",
      focus: "var(--x-text-selected)",
      inverse: "var(--x-bg-inverse)",
      link: "var(--x-text-link)",
      neutral: "var(--x-border)",
      selected: "var(--x-text-selected)",
      surface: "var(--x-bg-surface)",
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
      brand: "var(--x-brand)",
      currentColor: "currentColor",
      focus: "var(--x-text-selected)",
      inverse: "var(--x-bg-inverse)",
      link: "var(--x-text-link)",
      neutral: "var(--x-border)",
      selected: "var(--x-text-selected)",
      surface: "var(--x-bg-surface)",
      transparent: "transparent",
    },
    textColor: {
      brand: "var(--x-brand)",
      currentColor: "currentColor",
      default: "var(--x-text)",
      inverse: "var(--x-text-inverse)",
      "inverse-subtle": "var(--x-text-inverse-subtle)",
      link: "var(--x-text-link)",
      selected: "var(--x-text-selected)",
      subtle: "var(--x-text-subtle)",
      subtlest: "var(--x-text-subtlest)",
      transparent: "transparent",
    },
  },
};
