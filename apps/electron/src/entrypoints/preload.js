// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("triplex", {
  setMenu: (menu) => ipcRenderer.send("set-menu-bar", menu),
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
