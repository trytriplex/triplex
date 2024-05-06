/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type {
  ClientSendEventData,
  ClientSendEventName,
  ClientSendEventResponse,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
} from "./types";

export function on<TEvent extends HostSendEventName>(
  eventName: TEvent,
  callback: (
    data: HostSendEventData[TEvent]
  ) =>
    | void
    | HostSendEventResponse[TEvent]
    | Promise<HostSendEventResponse[TEvent]>
) {
  const cb = async (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      const value = await callback(e.data.data);

      if (value !== undefined) {
        respond(eventName, value);
        // This type errors when built in other packages. Suppress and move on.
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
      } else if (process.env.NODE_ENV === "test") {
        // Always respond in a test environment so we can assert that the event was called
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        respond(eventName, undefined as any);
      }
    }
  };

  window.addEventListener("message", cb, false);

  return () => {
    window.removeEventListener("message", cb, false);
  };
}

export function send<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  data: ClientSendEventData[TEvent],
  awaitResponse = false
): Promise<ClientSendEventResponse[TEvent]> {
  if (eventName.startsWith("self:")) {
    window.postMessage({ data, eventName }, "*");
  } else {
    window.parent.postMessage({ data, eventName }, "*");
  }

  if (awaitResponse) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseName = `${eventName}Response` as any;
      const cleanup = on(responseName, (responseValue) => {
        resolve(responseValue as ClientSendEventResponse[TEvent]);
        cleanup();
      });
    });
  }

  return Promise.resolve(undefined as ClientSendEventResponse[TEvent]);
}

function respond<TEvent extends keyof HostSendEventResponse>(
  eventName: TEvent,
  data: HostSendEventResponse[TEvent]
) {
  window.parent.postMessage({ data, eventName: `${eventName}Response` }, "*");
}

export { compose } from "./compose";

export interface SceneComponent {
  (props: unknown): JSX.Element;
}

export type Module = Record<string, SceneComponent>;

export type Modules = Record<string, () => Promise<Module>>;

export type ProviderComponent = (props: { children?: unknown }) => JSX.Element;

export type UnknownComponent = (props: Record<string, unknown>) => JSX.Element;

export type Config = { provider: string };

export type BootstrapFunction = (
  container: HTMLElement
) => (opts: {
  config: Config;
  files: Modules;
  provider: ProviderComponent;
}) => void;

export type ThumbnailFunction = (
  container: HTMLElement
) => (opts: {
  component: UnknownComponent;
  provider: ProviderComponent;
}) => void;

export interface EmbeddedMeta {
  column: number;
  line: number;
  name: string;
  path: string;
  rotate?: boolean;
  scale?: boolean;
  translate?: boolean;
}

export interface TriplexMeta extends EmbeddedMeta {
  parents: TriplexMeta[];
  props: Record<string, unknown>;
}

export interface TriplexResolvedMeta extends EmbeddedMeta {
  props: Record<string, unknown>;
}

export interface RendererElementProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __component: ((props: any) => any) | string;
  __meta: EmbeddedMeta;
  attach?: unknown;
  children?: unknown;
  name?: string;
  position?: unknown;
  rotation?: unknown;
  scale?: unknown;
}

export function init({
  RendererElement,
}: {
  RendererElement: (props: RendererElementProps) => unknown;
}) {
  // @ts-expect-error
  window.SceneObject = RendererElement;
}
