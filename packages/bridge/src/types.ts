export type ClientSendEventName = keyof ClientSendEventData;

export interface ClientSendEventData {
  "trplx:onSceneObjectBlur": {};
  "trplx:onSceneObjectFocus": { path: string };
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
}
