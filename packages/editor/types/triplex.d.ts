declare interface Window {
  triplex: {
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
  };
}
