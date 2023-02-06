export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onConnected": {};
  "trplx:onSceneObjectBlur": {};
  "trplx:onSceneObjectFocus": { path: string; line: number; column: number };
  "trplx:onSceneObjectNavigated": {
    path: string;
    props: Record<string, unknown>;
  };
  "trplx:requestSave": {};
  "trplx:requestActionMenu": {};
}

export type HostSendEventName = keyof HostSendEventData;

export interface HostSendEventData {
  "trplx:requestNavigateToSceneObject": {
    path: string;
    props: Record<string, unknown>;
  };
  "trplx:requestFocusSceneObject": {
    path: string;
    column: number;
    line: number;
  };
  "trplx:requestBlurSceneObject": {};
}
