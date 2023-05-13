// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("triplex", {
  platform: process.platform,
  openLink: (url) => ipcRenderer.send("open-link", url),
  setMenu: (menu) => ipcRenderer.send("set-menu-bar", menu),
  sendCommand: (id) => ipcRenderer.send("send-command", id),
  showSaveDialog: (filename) =>
    ipcRenderer.invoke("show-save-dialog", filename),
  handleMenuItemPress: (callback) => {
    const listener = (_, id) => {
      callback(id);
    };

    ipcRenderer.on("menu-item-press", listener);

    return () => {
      ipcRenderer.removeListener("menu-item-press", listener);
    };
  },
});
