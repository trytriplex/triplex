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
    client.addEventListener("message", () => {
      client.send(JSON.stringify({ name: "bar" }));
    });
  }),
];
