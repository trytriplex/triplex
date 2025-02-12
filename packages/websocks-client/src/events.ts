/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { parseJSON } from "./string";

export function createWSEvents<
  TWSEventDefinition extends Record<string, { data: unknown }>,
>() {
  function on<TEventName extends string & keyof TWSEventDefinition>(
    eventName: TEventName,
    callback: (data: TWSEventDefinition[TEventName]["data"]) => void,
    port: number,
  ) {
    const WS: typeof WebSocket =
      typeof WebSocket === "undefined" ? require("ws") : WebSocket;
    const ws = new WS(`ws://127.0.0.1:${port}`);

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
