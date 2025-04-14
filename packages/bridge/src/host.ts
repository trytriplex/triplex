/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { compose } from "./compose";
import { createKeyboardEventForwarder } from "./keyboard";
import type {
  Actions,
  ButtonControl,
  ButtonGroupControl,
  ClientSendEventData,
  ClientSendEventName,
  ClientSendEventResponse,
  Controls,
  ExtensionPointElement,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
  MenuControl,
  SeparatorControl,
  ToggleButtonControl,
} from "./types";

export {
  Actions,
  ButtonControl,
  ButtonGroupControl,
  ClientSendEventData,
  Controls,
  ExtensionPointElement,
  MenuControl,
  SeparatorControl,
  ToggleButtonControl,
};

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

export function on<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  callback: (
    args: ClientSendEventData[TEvent],
  ) =>
    | void
    | ClientSendEventResponse[TEvent]
    | Promise<ClientSendEventResponse[TEvent]>,
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
  if (process.env.NODE_ENV === "test") {
    // The iframe doesn't exist in a test environment so we return the top level window.
    return window;
  }

  // @ts-ignore — :-)
  if (window.triplex.env.mode === "webxr") {
    // When in WebXR the scene is the top level document instead of in an iframe.
    return window;
  }

  const sceneIframe = document.getElementsByTagName("iframe")[0];
  if (!sceneIframe) {
    throw new Error("invariant: scene iframe could not be found");
  }

  return sceneIframe.contentWindow;
}

export function send<TEvent extends HostSendEventName>(
  eventName: TEvent,
  data: HostSendEventData[TEvent],
  awaitResponse = process.env.NODE_ENV === "test",
): Promise<HostSendEventResponse[TEvent]> {
  const messageWindow = getMessageWindow();

  messageWindow?.postMessage(
    {
      data,
      eventName,
    },
    "*",
  );

  if (awaitResponse) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseName = `${eventName}Response` as any;
      const cleanup = on(responseName, (responseValue) => {
        resolve(responseValue as HostSendEventResponse[TEvent]);
        cleanup();
      });
    });
  }

  return Promise.resolve(undefined as HostSendEventResponse[TEvent]);
}

function respond<TEvent extends keyof ClientSendEventResponse>(
  eventName: TEvent,
  data: ClientSendEventResponse[TEvent],
) {
  const messageWindow = getMessageWindow();

  messageWindow?.postMessage(
    {
      data,
      eventName: `${eventName}Response`,
    },
    "*",
  );
}

export { compose } from "./compose";
