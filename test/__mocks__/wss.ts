/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
