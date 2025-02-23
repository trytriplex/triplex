/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { parseJSON } from "./string";

/**
 * **createWSEvents()**
 *
 * Returns typed event listener to be used with an instantiated websocks server.
 * Options can be either passed in immediately or passed in as a callback to be
 * called just-in-time when needed.
 *
 * ```ts
 * import { type Events } from "./server";
 *
 * createWSEvents<Routes>({ url: "ws://localhost:3000" });
 * const { on } = createWSEvents<Routes>(() => ({
 *   url: "ws://localhost:3000",
 * }));
 *
 * on("my-event", (data) => {
 *   console.log(data);
 * });
 * ```
 */
export function createWSEvents<
  TWSEventDefinition extends Record<string, { data: unknown }>,
>(opts: (() => { url: string }) | { url: string }) {
  function on<TEventName extends string & keyof TWSEventDefinition>(
    eventName: TEventName,
    callback: (data: TWSEventDefinition[TEventName]["data"]) => void,
  ) {
    const WS: typeof WebSocket =
      typeof WebSocket === "undefined" ? require("ws") : WebSocket;
    const url = typeof opts === "function" ? opts().url : opts.url;
    const ws = new WS(url);

    ws.addEventListener("open", () => {
      ws.send(eventName);
    });

    ws.addEventListener("message", (e) => {
      const parsed = parseJSON(e.data);
      callback(parsed);
    });

    return () => {
      ws.close();
    };
  }

  return {
    on,
  };
}
