/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type ClientSendEventName = keyof ClientSendEventData;

type Icon =
  | "all-sides"
  | "angle"
  | "camera"
  | "cursor"
  | "exit"
  | "exit"
  | "grid-perspective"
  | "grid"
  | "height"
  | "local"
  | "move"
  | "size"
  | "transform"
  | "world";

export interface ButtonGroupControl {
  buttons: {
    accelerator?: string;
    icon?: Icon;
    id: string;
    label: string;
  }[];
  defaultSelected?: string;
  groupId: string;
  type: "button-group";
}

export interface ToggleButtonControl {
  accelerator?: string;
  buttons: [
    {
      icon?: Icon;
      id: string;
      isSelected?: boolean;
      label: string;
    },
    {
      icon?: Icon;
      id: string;
      isSelected?: boolean;
      label: string;
    },
  ];
  groupId: string;
  type: "toggle-button";
}

export interface ButtonControl {
  accelerator?: string;
  icon?: Icon;
  id: string;
  label: string;
  type: "button";
}

export interface SeparatorControl {
  type: "separator";
}

export type Controls = (
  | ButtonControl
  | ButtonGroupControl
  | ToggleButtonControl
  | SeparatorControl
)[];

export type Actions = ((
  | ButtonControl
  | ButtonGroupControl
  | ToggleButtonControl
) & { filter: string })[];

export interface ClientSendEventData {
  "component-opened": {
    encodedProps: string;
    entered?: boolean;
    exportName: string;
    path: string;
  };
  "component-rendered": void;
  "element-blurred": undefined;
  "element-focused": {
    column: number;
    line: number;
    parentPath: string;
    path: string;
  };
  "element-set-prop": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  error: {
    col?: number;
    line?: number;
    message: string;
    source?: string;
    stack?: string;
    subtitle: string;
    title: string;
  };
  keydown: {
    altKey: boolean;
    code: string;
    ctrlKey: boolean;
    isComposing: boolean;
    key: string;
    keyCode: number;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
  };
  ready: undefined;
  "set-extension-points": {
    elements: Actions;
    scene: Controls;
  };
  track: { actionId: string };
}

export interface ClientSendEventResponse {
  "component-opened": void;
  "component-rendered": void;
  "element-blurred": void;
  "element-focused": void;
  "element-set-prop": void;
  error: void;
  keydown: void;
  ready: void;
  "set-extension-points": void;
  track: void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface ExtensionPointElement {
  column: number;
  line: number;
  parentPath: string;
}

export interface HostSendEventData {
  "extension-point-triggered":
    | {
        id: string;
        scope: "scene";
      }
    | {
        data: ExtensionPointElement;
        id: string;
        scope: "element";
      };
  "request-blur-element": undefined;
  "request-delete-element": {
    column: number;
    line: number;
    path: string;
  };
  "request-focus-element": {
    column: number;
    exportName?: string;
    line: number;
    parentPath: string;
    path: string;
  };
  "request-jump-to-element":
    | {
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "request-open-component":
    | {
        encodedProps: string;
        exportName: string;
        path: string;
      }
    | undefined;
  "request-refresh-scene": undefined;
  "request-reset-prop": {
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "request-reset-scene": undefined;
  "request-restore-element": {
    column: number;
    line: number;
    parentPath: string;
  };
  "request-set-element-prop": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "request-state-change": {
    camera: "default" | "editor";
    state: "play" | "pause" | "edit";
  };
  "self:request-reset-file": { path: string };
}

export interface HostSendEventResponse {
  "extension-point-triggered": { handled: boolean };
  "request-blur-element": void;
  "request-delete-element": void;
  "request-focus-element": void;
  "request-jump-to-element": void;
  "request-open-component": void;
  "request-refresh-scene": void;
  "request-reset-prop": void;
  "request-reset-scene": void;
  "request-restore-element": void;
  "request-set-element-prop": void;
  "request-state-change": void;
  "self:request-reset-file": void;
}
