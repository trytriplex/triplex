import type {
  ClientSendEventData,
  ClientSendEventName,
  HostSendEventData,
  HostSendEventName,
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
  data: HostSendEventData[TEvent]
) {
  iframe.contentWindow?.postMessage({
    eventName,
    data,
  });
}

export { compose } from "./compose";
