import type {
  ClientSendEventData,
  ClientSendEventName,
  HostSendEventData,
  HostSendEventName,
} from "./types";

export function send<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  data: ClientSendEventData[TEvent]
) {
  window.top?.postMessage({ eventName, data });
}

export function listen<TEvent extends HostSendEventName>(
  eventName: TEvent,
  callback: (ata: HostSendEventData[TEvent]) => void
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
