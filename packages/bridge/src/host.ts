import type {
  ClientSendEventData,
  ClientSendEventName,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
} from "./types";

export function listen<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  callback: (ata: ClientSendEventData[TEvent]) => void
) {
  const cb = (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      callback(e.data.data);
    }
  };

  window.addEventListener("message", cb, false);

  return () => {
    window.removeEventListener("message", cb, false);
  };
}

export function send<TEvent extends HostSendEventName>(
  iframe: HTMLIFrameElement,
  eventName: TEvent,
  data: HostSendEventData[TEvent],
  awaitResponse = false
): Promise<HostSendEventResponse[TEvent]> {
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

export { compose } from "./compose";
