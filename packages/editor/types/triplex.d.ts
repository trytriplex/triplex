declare interface Window {
  triplex: {
    showSaveDialog: (filename: string) => Promise<string | undefined>;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
  };
}
