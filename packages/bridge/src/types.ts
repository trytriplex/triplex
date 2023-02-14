export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onConnected": undefined;
  "trplx:onSceneObjectBlur": undefined;
  "trplx:onSceneObjectFocus": {
    path: string;
    line: number;
    column: number;
    name: string;
  };
  "trplx:onSceneObjectNavigated": {
    path: string;
    encodedProps: string;
  };
  "trplx:requestSave": undefined;
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestNavigateToScene":
    | {
        path: string;
        encodedProps: string;
      }
    | undefined;
  "trplx:requestFocusSceneObject": {
    path: string;
    column: number;
    line: number;
  };
  "trplx:requestJumpToSceneObject": undefined;
  "trplx:requestBlurSceneObject": undefined;
}
