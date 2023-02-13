export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onConnected": {};
  "trplx:onSceneObjectBlur": {};
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
  "trplx:requestSave": {};
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
  "trplx:requestJumpToSceneObject": {};
  "trplx:requestBlurSceneObject": {};
}
