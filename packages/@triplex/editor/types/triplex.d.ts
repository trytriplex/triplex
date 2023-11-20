/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
declare type WindowState = "active" | "inactive" | "disabled";

type Key =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | number;

declare interface Window {
  triplex: {
    accelerator: (
      accelerator:
        | `CommandOrCtrl+${Key}`
        | `CommandOrCtrl+Shift+${Key}`
        | `Shift+${Key}`,
      callback: () => void
    ) => () => void;
    getEnv: () => Promise<{
      config: {
        assetsDir: string;
        components: string[];
        cwd: string;
        files: string[];
        provider?: string;
        publicDir: string;
      };
    }>;
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
    handleProgressBarChange: (
      callback: (progress: number) => void
    ) => () => void;
    handleWindowStateChange: (
      callback: (state: WindowState) => void
    ) => () => void;
    openIDE: (path: string, opts?: { column: number; line: number }) => void;
    openLink: (url: string) => void;
    platform: typeof process.platform;
    sendCommand: (
      id:
        | "open-project"
        | "create-project"
        | "view-logs"
        | "close-project"
        | "show-devtools"
    ) => void;
    sessionId: string;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    showSaveDialog: (filename: string) => Promise<string | undefined>;
    userId: string;
  };
}
