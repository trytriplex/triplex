/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { join } = require("upath");

/**
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  content: [
    join(__dirname, "./src/app/**/*.tsx"),
    join(__dirname, "./index.html"),
    join(__dirname, "./loading.html"),
  ],
  theme: {
    backgroundColor: {
      "active-selected": "var(--vscode-list-activeSelectionBackground)",
      hover: "var(--vscode-toolbar-hoverBackground)",
      "inactive-selected": "var(--vscode-list-inactiveSelectionBackground)",
      "list-hovered": "var(--vscode-list-hoverBackground)",
      overlay: "var(--panel-view-background)",
      selected: "var(--vscode-toolbar-activeBackground)",
    },
    borderColor: {
      overlay: "var(--panel-view-border)",
      selected: "var(--vscode-focusBorder)",
    },
    boxShadow: {
      overlay: "var(--vscode-widget-shadow)",
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
      "list-hovered": "var(--vscode-list-hoverForeground)",
      selected: "var(--vscode-tab-activeForeground)",
    },
  },
};
