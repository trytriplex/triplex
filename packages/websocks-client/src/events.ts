/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
