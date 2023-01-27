import type {
  ClientEventData,
  ClientEventName,
  HostEventData,
  HostEventName,
} from "./types";

export function send<TEvent extends ClientEventName>(
  eventName: TEvent,
  data: ClientEventData[TEvent]
) {
  window.top?.postMessage({ eventName, data });
}

export function listen<TEvent extends HostEventName>(
  eventName: TEvent,
  callback: (ata: HostEventData[TEvent]) => void
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
