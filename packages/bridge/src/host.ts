import type {
  ClientEventData,
  ClientEventName,
  HostEventData,
  HostEventName,
} from "./types";

export function listen<TEvent extends ClientEventName>(
  eventName: TEvent,
  callback: (ata: ClientEventData[TEvent]) => void
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

export function send<TEvent extends HostEventName>(
  iframe: HTMLIFrameElement,
  eventName: TEvent,
  data: HostEventData[TEvent]
) {
  iframe.contentWindow?.postMessage({
    eventName,
    data,
  });
}
