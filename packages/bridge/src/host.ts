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

      if (typeof value !== "undefined") {
        respond(eventName, value);
      }
    }
  };

  window.addEventListener("message", cb, false);

  return () => {
    window.removeEventListener("message", cb, false);
  };
}

export function send<TEvent extends HostSendEventName>(
  eventName: TEvent,
  data: HostSendEventData[TEvent],
  awaitResponse = false
): Promise<HostSendEventResponse[TEvent]> {
  const iframe = document.getElementsByTagName("iframe")[0];
  iframe.contentWindow?.postMessage({
    eventName,
    data,
  });

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
  const iframe = document.getElementsByTagName("iframe")[0];
  iframe.contentWindow?.postMessage({
    eventName: `${eventName}Response`,
    data,
  });
}

export { compose } from "./compose";
