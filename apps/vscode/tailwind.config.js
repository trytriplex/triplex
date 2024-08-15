/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { join } = require("upath");

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    join(__dirname, "./src/app/**/*.tsx"),
    join(__dirname, "../packages/@triplex/ux/**/*.tsx"),
    join(__dirname, "./index.html"),
    join(__dirname, "./loading.html"),
  ],
  theme: {
    backgroundColor: {
      "active-selected": "var(--vscode-list-activeSelectionBackground)",
      editor: "var(--vscode-editor-background)",
      hover: "var(--vscode-toolbar-hoverBackground)",
      "inactive-selected": "var(--vscode-list-inactiveSelectionBackground)",
      input: "var(--vscode-input-background)",
      "list-hovered": "var(--vscode-list-hoverBackground)",
      overlay: "var(--panel-view-background)",
      scrollbar: "var(--vscode-scrollbarSlider-background)",
      "scrollbar-active": "var(--vscode-scrollbarSlider-activeBackground)",
      "scrollbar-hovered": "var(--vscode-scrollbarSlider-hoverBackground)",
      selected: "var(--vscode-toolbar-activeBackground)",
    },
    borderColor: {
      input: "var(--vscode-dropdown-border)",
      overlay: "var(--vscode-panel-border)",
      selected: "var(--vscode-focusBorder)",
      transparent: "transparent",
    },
    boxShadow: {
      overlay: "var(--vscode-widget-shadow)",
      scrollbar: "var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset",
    },
    fontFamily: {
      default: "var(--vscode-font-family)",
    },
    fontSize: {
      default: "var(--vscode-font-size)",
    },
    fontWeight: {
      default: "var(--vscode-font-weight)",
    },
    outlineColor: {
      selected: "var(--focus-border)",
    },
    outlineOffset: {
      button: "var(--button-icon-outline-offset)",
      inset: "-1px",
    },
    outlineWidth: {
      default: "calc(var(--border-width) * 1px)",
    },
    textColor: {
      "active-selected": "var(--vscode-list-activeSelectionForeground)",
      default: "var(--vscode-foreground)",
      error: "var(--vscode-editorError-foreground)",
      info: "var(--vscode-editorInfo-foreground)",
      input: "var(--vscode-input-foreground)",
      "input-placeholder": "var(--vscode-input-placeholderForeground)",
      link: "var(--vscode-textLink-foreground)",
      "list-hovered": "var(--vscode-list-hoverForeground)",
      selected: "var(--vscode-tab-activeForeground)",
      warning: "var(--vscode-editorWarning-foreground)",
    },
  },
};
