declare type WindowState = "active" | "inactive" | "disabled";

declare interface Window {
  triplex: {
    platform: typeof process.platform;
    handleProgressBarChange: (
      callback: (progress: number) => void
    ) => () => void;
    handleWindowStateChange: (
      callback: (state: WindowState) => void
    ) => () => void;
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
    openLink: (url: string) => void;
    sendCommand: (id: string) => void;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    showSaveDialog: (filename: string) => Promise<string | undefined>;
  };
}
