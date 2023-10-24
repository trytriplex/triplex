/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TWSEventDefinition } from "@triplex/server";
import { parseJSON } from "./string";

export function on<TEventName extends keyof TWSEventDefinition>(
  eventName: TEventName,
  callback: (data: TWSEventDefinition[TEventName]["data"]) => void
) {
  const WS: typeof WebSocket =
    typeof WebSocket === "undefined" ? require("ws") : WebSocket;
  const ws = new WS("ws://127.0.0.1:3300");

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
