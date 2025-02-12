/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
type EditorConfig = import("@triplex/server").EditorSettings;
type ProjectSettings = import("@triplex/server").ProjectSettings;
type ReconciledTriplexConfig =
  import("@triplex/server").ReconciledTriplexConfig;
type TriplexPorts = import("@triplex/server").TriplexPorts;

declare type WindowState = "active" | "inactive" | "disabled";

declare type TriplexActionId =
  | "open-project"
  | "create-project"
  | "view-logs"
  | "close-project"
  | "show-devtools"
  | "show-app-dir";

declare interface Window {
  triplex: {
    accelerator: (accelerator: string, callback: () => void) => () => void;
    env: {
      config: ReconciledTriplexConfig;
      editor: EditorConfig;
      ports: TriplexPorts;
      project: ProjectSettings;
    };
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
    handleProgressBarChange: (
      callback: (progress: number) => void,
    ) => () => void;
    handleWindowStateChange: (
      callback: (state: WindowState) => void,
    ) => () => void;
    openIDE: (path: string, opts?: { column: number; line: number }) => void;
    openLink: (url: string) => void;
    platform: typeof process.platform;
    sendCommand: (id: TriplexActionId) => void;
    sessionId: string;
    setEditorConfig: <TKey extends keyof EditorConfig>(
      key: TKey,
      value: EditorConfig[TKey],
    ) => void;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    showSaveDialog: (filename: string) => Promise<string | undefined>;
    userId: string;
  };
}
