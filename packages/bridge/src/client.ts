import type {
  ClientSendEventData,
  ClientSendEventName,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
} from "./types";

export function send<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  data: ClientSendEventData[TEvent]
) {
  window.top?.postMessage({ eventName, data });
}

function respond<TEvent extends keyof HostSendEventResponse>(
  eventName: TEvent,
  data: HostSendEventResponse[TEvent]
) {
  window.top?.postMessage({ eventName: `${eventName}Response`, data });
}

export function listen<TEvent extends HostSendEventName>(
  eventName: TEvent,
  callback: (
    data: HostSendEventData[TEvent]
  ) => void | HostSendEventResponse[TEvent]
) {
  const cb = (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      const value = callback(e.data.data);

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

export { compose } from "./compose";
