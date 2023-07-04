/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onOpenFileHmr": undefined;
  "trplx:onError": {
    message: string;
    line: number;
    col: number;
    source: string;
    stack: string;
  };
  "trplx:onAddNewComponent": {
    type:
      | {
          type: "custom";
          path: string;
          name: string;
          exportName: string;
          props: Record<string, unknown>;
        }
      | {
          type: "host";
          name: string;
          props: Record<string, unknown>;
        };
    target?: {
      line: number;
      column: number;
      action: "child";
    };
  };
  "trplx:onConnected": undefined;
  "trplx:onSceneObjectDelete": {
    column: number;
    line: number;
    path: string;
  };
  "trplx:onConfirmSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "trplx:onSceneObjectBlur": undefined;
  "trplx:onSceneObjectFocus": {
    line: number;
    column: number;
  };
  "trplx:onTransformChange": {
    mode: "translate" | "scale" | "rotate";
  };
  "trplx:onCameraTypeChange": {
    type: "perspective" | "orthographic";
  };
  "trplx:onSceneObjectNavigated": {
    path: string;
    exportName: string;
    encodedProps: string;
    entered?: boolean;
  };
  "trplx:requestSave": undefined;
  "trplx:requestRedo": undefined;
  "trplx:requestUndo": undefined;
  "trplx:requestDeleteSceneObject": undefined;
  "trplx:onStateChange": {
    change: "userCamera";
    data: { line: number; column: number; path: string };
  };
}

export interface ClientSendEventResponse {
  "trplx:onOpenFileHmr": void;
  "trplx:onAddNewComponent": {
    line: number;
    column: number;
  };
  "trplx:onError": void;
  "trplx:onConnected": void;
  "trplx:onConfirmSceneObjectProp": void;
  "trplx:onSceneObjectBlur": void;
  "trplx:onSceneObjectDelete": void;
  "trplx:onSceneObjectFocus": void;
  "trplx:onTransformChange": void;
  "trplx:onCameraTypeChange": void;
  "trplx:onSceneObjectNavigated": void;
  "trplx:requestSave": void;
  "trplx:requestRedo": void;
  "trplx:requestUndo": void;
  "trplx:requestDeleteSceneObject": void;
  "trplx:onStateChange": void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestAction": { action: "viewFocusedCamera" | "resetCamera" };
  "trplx:requestRefresh": undefined;
  "trplx:requestAddNewComponent": {
    type:
      | {
          type: "custom";
          path: string;
          name: string;
          exportName: string;
          props: Record<string, unknown>;
        }
      | {
          type: "host";
          name: string;
          props: Record<string, unknown>;
        };
    target?: {
      line: number;
      column: number;
      action: "child";
    };
  };
  "trplx:requestDeleteSceneObject": {
    column: number;
    line: number;
    path: string;
  };
  "trplx:requestRestoreSceneObject": {
    column: number;
    line: number;
    path: string;
  };
  "trplx:requestSetSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "trplx:requestPersistSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "trplx:requestTransformChange": {
    mode: "translate" | "scale" | "rotate";
  };
  "trplx:requestCameraTypeChange": {
    type: "perspective" | "orthographic";
  };
  "trplx:requestResetSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "trplx:requestNavigateToScene":
    | {
        path: string;
        encodedProps: string;
        exportName: string;
      }
    | undefined;
  "trplx:requestFocusSceneObject": {
    column: number;
    line: number;
    ownerPath: string;
  };
  "trplx:requestSceneObjectPropValue": {
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "trplx:requestJumpToSceneObject": undefined;
  "trplx:requestBlurSceneObject": undefined;
  "trplx:requestReset": undefined;
}

export interface HostSendEventResponse {
  "trplx:requestRefresh": void;
  "trplx:requestAddNewComponent": void;
  "trplx:requestBlurSceneObject": void;
  "trplx:requestDeleteSceneObject": void;
  "trplx:requestFocusSceneObject": void;
  "trplx:requestJumpToSceneObject": void;
  "trplx:requestNavigateToScene": void;
  "trplx:requestPersistSceneObjectProp": void;
  "trplx:requestReset": void;
  "trplx:requestResetSceneObjectProp": void;
  "trplx:requestRestoreSceneObject": void;
  "trplx:requestSceneObjectPropValue": { value: unknown };
  "trplx:requestSetSceneObjectProp": void;
  "trplx:requestTransformChange": void;
  "trplx:requestCameraTypeChange": void;
  "trplx:requestAction": void;
}
