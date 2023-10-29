/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type ClientSendEventName = keyof ClientSendEventData;

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
  "trplx:onCameraTypeChange": {
    type: "perspective" | "orthographic";
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
  "trplx:onStateChange": {
    change: "userCamera";
    data: { column: number; line: number; path: string };
  };
  "trplx:onTransformChange": {
    mode: "translate" | "scale" | "rotate";
  };
  "trplx:requestDeleteSceneObject": undefined;
  "trplx:requestRedo": undefined;
  "trplx:requestSave": undefined;
  "trplx:requestUndo": undefined;
}

export interface ClientSendEventResponse {
  "trplx:onAddNewComponent": {
    column: number;
    line: number;
    path: string;
  };
  "trplx:onCameraTypeChange": void;
  "trplx:onConfirmSceneObjectProp": void;
  "trplx:onConnected": void;
  "trplx:onError": void;
  "trplx:onSceneLoaded": void;
  "trplx:onSceneObjectBlur": void;
  "trplx:onSceneObjectFocus": void;
  "trplx:onSceneObjectNavigated": void;
  "trplx:onStateChange": void;
  "trplx:onTransformChange": void;
  "trplx:requestDeleteSceneObject": void;
  "trplx:requestRedo": void;
  "trplx:requestSave": void;
  "trplx:requestUndo": void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestAction":
    | { action: "resetCamera" }
    | {
        action: "enterCamera";
        data?: { column: number; line: number; path: string };
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
  "trplx:requestCameraTypeChange": {
    type: "perspective" | "orthographic";
  };
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
  "trplx:requestTransformChange": {
    mode: "translate" | "scale" | "rotate";
  };
}

export interface HostSendEventResponse {
  "trplx:requestAction": void;
  "trplx:requestAddNewComponent": void;
  "trplx:requestBlurSceneObject": void;
  "trplx:requestCameraTypeChange": void;
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
  "trplx:requestTransformChange": void;
}
