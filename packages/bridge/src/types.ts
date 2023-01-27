export type ClientEventName = keyof ClientEventData;

export interface ClientEventData {
  "trplx:close": {};
  "trplx:focus": { path: string };
  "trplx:navigate": { path: string; props: Record<string, unknown> };
  "trplx:save": {};
  "trplx:showActionMenu": {};
}

export type HostEventName = keyof HostEventData;

export interface HostEventData {
  "trplx:navigate": { path: string; props: Record<string, unknown> };
}
