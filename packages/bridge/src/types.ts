export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onAddNewComponent":
    | {
        type: "custom";
        path: string;
        exportName: string;
        props: Record<string, unknown>;
      }
    | {
        type: "host";
        name: string;
        props: Record<string, unknown>;
      };
  "trplx:onConnected": undefined;
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
  "trplx:onSceneObjectNavigated": {
    path: string;
    exportName: string;
    encodedProps: string;
  };
  "trplx:requestSave": undefined;
  "trplx:requestRedo": undefined;
  "trplx:requestUndo": undefined;
}

export interface ClientSendEventResponse {
  "trplx:onAddNewComponent": {
    line: number;
    column: number;
  };
  "trplx:onConnected": void;
  "trplx:onConfirmSceneObjectProp": void;
  "trplx:onSceneObjectBlur": void;
  "trplx:onSceneObjectFocus": void;
  "trplx:onTransformChange": void;
  "trplx:onSceneObjectNavigated": void;
  "trplx:requestSave": void;
  "trplx:requestRedo": void;
  "trplx:requestUndo": void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestAddNewComponent":
    | {
        type: "custom";
        path: string;
        exportName: string;
        props: Record<string, unknown>;
      }
    | {
        type: "host";
        name: string;
        props: Record<string, unknown>;
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
}

export interface HostSendEventResponse {
  "trplx:requestAddNewComponent": void;
  "trplx:requestBlurSceneObject": void;
  "trplx:requestFocusSceneObject": void;
  "trplx:requestJumpToSceneObject": void;
  "trplx:requestNavigateToScene": void;
  "trplx:requestPersistSceneObjectProp": void;
  "trplx:requestResetSceneObjectProp": void;
  "trplx:requestSceneObjectPropValue": { value: unknown };
  "trplx:requestSetSceneObjectProp": void;
  "trplx:requestTransformChange": void;
}
