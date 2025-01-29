/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ws } from "msw";

const wssURL = `ws://localhost:3`;
const mockWSS = ws.link(wssURL);

export const handlers = [
  mockWSS.addEventListener("connection", ({ client }) => {
    let errorCount = 0;

    client.addEventListener("message", (e) => {
      switch (e.data) {
        case "/errors":
          client.send(JSON.stringify({ error: "Websocket server error!" }));
          break;

        case "/errors-once": {
          errorCount += 1;

          if (errorCount >= 1) {
            client.send(JSON.stringify({ name: "bar" }));
          } else {
            client.send(JSON.stringify({ error: "Websocket server error!" }));
          }

          break;
        }

        default:
          client.send(JSON.stringify({ name: "bar" }));
      }
    });
  }),
];
