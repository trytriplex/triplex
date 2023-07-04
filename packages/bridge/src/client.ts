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

export function listen<TEvent extends HostSendEventName>(
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

      if (typeof value !== "undefined") {
        respond(eventName, value);
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
  window.top?.postMessage({ eventName, data }, "*");

  if (awaitResponse) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseName = `${eventName}Response` as any;
      const cleanup = listen(responseName, (responseValue) => {
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
  window.top?.postMessage({ eventName: `${eventName}Response`, data }, "*");
}

export { compose } from "./compose";
