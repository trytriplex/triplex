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
  | "exit"
  | "grid"
  | "camera"
  | "move"
  | "exit"
  | "grid-perspective"
  | "transform";

export interface ButtonGroupControl {
  buttons: {
    accelerator?: string;
    icon?: Icon;
    id: string;
    label: string;
  }[];
  defaultSelected?: string;
  id: string;
  type: "button-group";
}

export interface ToggleButtonControl {
  accelerator?: string;
  buttons: [
    {
      icon?: Icon;
      id: string;
      label: string;
    },
    {
      icon?: Icon;
      id: string;
      label: string;
    }
  ];
  id: string;
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
  "trplx:onAddNewComponent": {
    target?: {
      action: "child";
      column: number;
      exportName: string;
      line: number;
      path: string;
    };
    type:
      | {
          exportName: string;
          name: string;
          path: string;
          props: Record<string, unknown>;
          type: "custom";
        }
      | {
          name: string;
          props: Record<string, unknown>;
          type: "host";
        };
  };
  "trplx:onConfirmSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "trplx:onConnected": undefined;
  "trplx:onError": {
    col: number;
    line: number;
    message: string;
    source: string;
    stack: string;
  };
  "trplx:onSceneLoaded": void;
  "trplx:onSceneObjectBlur": undefined;
  "trplx:onSceneObjectFocus": {
    column: number;
    line: number;
    parentPath: string;
    path: string;
  };
  "trplx:onSceneObjectNavigated": {
    encodedProps: string;
    entered?: boolean;
    exportName: string;
    path: string;
  };
  "trplx:onSetControls": {
    controls: Controls;
  };
  "trplx:onSetElementActions": {
    actions: Actions;
  };
}

export interface ClientSendEventResponse {
  "trplx:onAddNewComponent": {
    column: number;
    line: number;
    path: string;
  };
  "trplx:onConfirmSceneObjectProp": void;
  "trplx:onConnected": void;
  "trplx:onError": void;
  "trplx:onSceneLoaded": void;
  "trplx:onSceneObjectBlur": void;
  "trplx:onSceneObjectFocus": void;
  "trplx:onSceneObjectNavigated": void;
  "trplx:onSetControls": void;
  "trplx:onSetElementActions": void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:onControlClick": {
    id: string;
  };
  "trplx:onElementActionClick": {
    data: {
      column: number;
      line: number;
      parentPath: string;
    };
    id: string;
  };
  "trplx:requestAddNewComponent": {
    target?: {
      action: "child";
      column: number;
      exportName: string;
      line: number;
      path: string;
    };
    type:
      | {
          exportName: string;
          name: string;
          path: string;
          props: Record<string, unknown>;
          type: "custom";
        }
      | {
          name: string;
          props: Record<string, unknown>;
          type: "host";
        };
  };
  "trplx:requestBlurSceneObject": undefined;
  "trplx:requestDeleteSceneObject": {
    column: number;
    line: number;
    parentPath: string;
  };
  "trplx:requestFocusSceneObject": {
    column: number;
    line: number;
    parentPath: string;
    path: string;
  };
  "trplx:requestJumpToSceneObject":
    | {
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "trplx:requestNavigateToScene":
    | {
        encodedProps: string;
        exportName: string;
        path: string;
      }
    | undefined;
  "trplx:requestPersistSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "trplx:requestRefresh": { hard?: boolean };
  "trplx:requestReset": undefined;
  "trplx:requestResetSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "trplx:requestRestoreSceneObject": {
    column: number;
    line: number;
    parentPath: string;
  };
  "trplx:requestSceneObjectPropValue": {
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "trplx:requestSetSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
}

export interface HostSendEventResponse {
  "trplx:onControlClick": { handled: boolean };
  "trplx:onElementActionClick": { handled: boolean };
  "trplx:requestAddNewComponent": void;
  "trplx:requestBlurSceneObject": void;
  "trplx:requestDeleteSceneObject": void;
  "trplx:requestFocusSceneObject": void;
  "trplx:requestJumpToSceneObject": void;
  "trplx:requestNavigateToScene": void;
  "trplx:requestPersistSceneObjectProp": void;
  "trplx:requestRefresh": void;
  "trplx:requestReset": void;
  "trplx:requestResetSceneObjectProp": void;
  "trplx:requestRestoreSceneObject": void;
  "trplx:requestSceneObjectPropValue": { value: unknown };
  "trplx:requestSetSceneObjectProp": void;
}
