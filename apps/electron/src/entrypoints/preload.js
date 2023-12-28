/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { contextBridge, ipcRenderer } = require("electron");

const args = Array.from(process.argv).reduce((acc, arg) => {
  if (arg.startsWith("--")) {
    const [key, value] = arg.slice(2).split("=");

    if (key.match(/[A-Z]/)) {
      throw new Error(
        `invariant: key ${key} must be lowercase for cross platform support`
      );
    }

    acc[key] = value;
  }

  return acc;
}, {});

const declaredAccelerators = {};
const env = args.triplex_data ? JSON.parse(args.triplex_data) : {};
const editorConfig = args.editor_config ? JSON.parse(args.editor_config) : {};

contextBridge.exposeInMainWorld("triplex", {
  accelerator: (accelerator, callback) => {
    const listener = () => {
      if (document.activeElement.tagName === "INPUT") {
        // Bail out if the user is typing in an input field
        return;
      }

      callback();
    };

    if (declaredAccelerators[accelerator]) {
      throw new Error(`invariant: ${accelerator} accelerator already declared`);
    }

    declaredAccelerators[accelerator] = true;
    ipcRenderer.on(`acl:${accelerator}`, listener);

    return () => {
      delete declaredAccelerators[accelerator];
      ipcRenderer.removeListener(`acl:${accelerator}`, listener);
    };
  },
  get editorConfig() {
    if (!editorConfig) {
      throw new Error("invariant: unavailable in this context");
    }

    return editorConfig;
  },
  get env() {
    if (!env) {
      throw new Error("invariant: unavailable in this context");
    }

    return env;
  },
  handleMenuItemPress: (callback) => {
    const listener = (_, id) => {
      callback(id);
    };

    ipcRenderer.on("menu-item-press", listener);

    return () => {
      ipcRenderer.removeListener("menu-item-press", listener);
    };
  },
  handleProgressBarChange: (callback) => {
    const listener = (_, state) => {
      callback(state);
    };

    ipcRenderer.on("progress-bar-change", listener);

    return () => {
      ipcRenderer.removeListener("progress-bar-change", listener);
    };
  },
  handleWindowStateChange: (callback) => {
    const listener = (_, state) => {
      callback(state);
    };

    ipcRenderer.on("window-state-change", listener);

    return () => {
      ipcRenderer.removeListener("window-state-change", listener);
    };
  },
  openIDE: (path, opts) => ipcRenderer.send("open-editor", path, opts),
  openLink: (url) => ipcRenderer.send("open-link", url),
  platform: process.platform,
  sendCommand: (id) => ipcRenderer.send("send-command", id),
  sessionId: args.session_id,
  setEditorConfig: (key, value) =>
    ipcRenderer.send("update-editor-config", key, value),
  setMenu: (menu) => ipcRenderer.send("set-menu-bar", menu),
  showSaveDialog: (filename) =>
    ipcRenderer.invoke("show-save-dialog", filename),
  userId: args.user_id,
});
