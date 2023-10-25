/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("triplex", {
  getEnv: () => {
    try {
      return ipcRenderer.invoke("get-triplex-env");
    } catch {
      return null;
    }
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
  openLink: (url) => ipcRenderer.send("open-link", url),
  platform: process.platform,
  sendCommand: (id) => ipcRenderer.send("send-command", id),
  setMenu: (menu) => ipcRenderer.send("set-menu-bar", menu),
  showSaveDialog: (filename) =>
    ipcRenderer.invoke("show-save-dialog", filename),
});
