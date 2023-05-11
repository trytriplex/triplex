declare interface Window {
  triplex: {
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
    openLink: (url: string) => void;
    sendCommand: (id: string) => void;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    showSaveDialog: (filename: string) => Promise<string | undefined>;
  };
}
