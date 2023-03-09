export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onConnected": undefined;
  "trplx:onSceneObjectBlur": undefined;
  "trplx:onSceneObjectFocus": {
    line: number;
    column: number;
  };
  "trplx:onSceneObjectNavigated": {
    path: string;
    exportName: string;
    encodedProps: string;
  };
  "trplx:requestSave": undefined;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestSetSceneObjectProp": {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
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
  "trplx:requestJumpToSceneObject": undefined;
  "trplx:requestBlurSceneObject": undefined;
}
