/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type FGEnvironment } from "@triplex/lib/types";
import { type JSX } from "react";
import { compose } from "./compose";
import { createKeyboardEventForwarder } from "./keyboard";
import type {
  ClientSendEventData,
  ClientSendEventName,
  ClientSendEventResponse,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
} from "./types";

export function broadcastForwardedKeyboardEvents() {
  return compose([
    on("keydown", (data) => {
      window.dispatchEvent(new KeyboardEvent("keydown", data));
    }),
    on("keyup", (data) => {
      window.dispatchEvent(new KeyboardEvent("keyup", data));
    }),
  ]);
}

export function forwardKeyboardEvents() {
  return createKeyboardEventForwarder((eventName, data) => {
    send(eventName, data);
  });
}

export function on<TEvent extends HostSendEventName>(
  eventName: TEvent,
  callback: (
    data: HostSendEventData[TEvent],
  ) =>
    | void
    | HostSendEventResponse[TEvent]
    | Promise<HostSendEventResponse[TEvent]>,
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
  awaitResponse = false,
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
  data: HostSendEventResponse[TEvent],
) {
  window.parent.postMessage({ data, eventName: `${eventName}Response` }, "*");
}

export { compose } from "./compose";

export interface SceneComponent {
  (props: unknown): JSX.Element;
  triplexMeta: SceneMeta;
}

export interface SceneMeta {
  lighting: "default" | "custom";
  root: "react" | "react-three-fiber" | undefined;
}

export type Module = Record<string, SceneComponent>;

export type Modules = Record<string, () => Promise<Module>>;

export type ProviderComponent = (props: {
  children?: React.ReactNode;
}) => JSX.Element;

export interface ProviderModule {
  CanvasProvider: ProviderComponent;
  GlobalProvider: ProviderComponent;
}

export type UnknownComponent = (props: Record<string, unknown>) => JSX.Element;

export type Config = { provider: string };

export type BootstrapFunction = (
  container: HTMLElement,
) => (opts: {
  config: Config;
  fgEnvironmentOverride: FGEnvironment;
  files: Modules;
  isWebXR: boolean;
  providers: ProviderModule;
  userId: string;
}) => void;

export type ThumbnailFunction = (
  container: HTMLElement,
) => (opts: { component: SceneComponent; providers: ProviderModule }) => void;

export interface EmbeddedMeta {
  column: number;
  exportName?: string;
  line: number;
  name: string;
  originExportName?: string;
  originPath?: string;
  path: string;
  rotate?: boolean;
  scale?: boolean;
  translate?: boolean;
}

export interface TriplexMeta extends EmbeddedMeta {
  parents: TriplexMeta[];
  props: Record<string, unknown>;
}

export interface TaggedMeta {
  __triplex: TriplexMeta;
}

export interface RendererElementProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __component: ((props: any) => any) | string;
  __meta: EmbeddedMeta;
  attach?: unknown;
  children?: unknown;
  forceInsideSceneObjectContext?: boolean;
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
