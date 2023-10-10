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

export function listen<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  callback: (
    data: ClientSendEventData[TEvent]
  ) =>
    | void
    | ClientSendEventResponse[TEvent]
    | Promise<ClientSendEventResponse[TEvent]>
) {
  const cb = async (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      const value = await callback(e.data.data);

      if (value !== undefined) {
        respond(eventName, value);
      }
    }
  };

  window.addEventListener("message", cb, false);

  return () => {
    window.removeEventListener("message", cb, false);
  };
}

function getMessageWindow() {
  const iframe = document.getElementsByTagName("iframe")[0];
  const messageWindow =
    process.env.NODE_ENV === "test"
      ? // In a test environment there won't be an iframe so we just return the window
        window
      : iframe.contentWindow;

  return messageWindow;
}

export function send<TEvent extends HostSendEventName>(
  eventName: TEvent,
  data: HostSendEventData[TEvent],
  awaitResponse = false
): Promise<HostSendEventResponse[TEvent]> {
  const messageWindow = getMessageWindow();

  messageWindow?.postMessage(
    {
      data,
      eventName,
    },
    "*"
  );

  if (awaitResponse) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseName = `${eventName}Response` as any;
      const cleanup = listen(responseName, (responseValue) => {
        resolve(responseValue as HostSendEventResponse[TEvent]);
        cleanup();
      });
    });
  }

  return Promise.resolve(undefined as HostSendEventResponse[TEvent]);
}

function respond<TEvent extends keyof ClientSendEventResponse>(
  eventName: TEvent,
  data: ClientSendEventResponse[TEvent]
) {
  const messageWindow = getMessageWindow();

  messageWindow?.postMessage(
    {
      data,
      eventName: `${eventName}Response`,
    },
    "*"
  );
}

export { compose } from "./compose";
