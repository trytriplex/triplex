/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createServer } from "node:http";
import { match } from "node-match-path";
import { WebSocketServer, type WebSocket } from "ws";
import { decodeParams, stringifyJSON } from "./string";
import {
  type AliveWebSocket,
  type RouteHandler,
  type RouteOpts,
  type RouteParams,
  type UnionToIntersection,
} from "./types";

function collectTypes<TRoutes extends Array<Record<string, unknown>>>(
  _: TRoutes,
): UnionToIntersection<TRoutes[number]> {
  // This is opaque, purely used to return what the types are.
  // Accessing it at runtime won't do anything.
  return {} as UnionToIntersection<TRoutes[number]>;
}

export function createWSServer() {
  const server = createServer();
  const eventHandlers: Record<string, (ws: WebSocket) => void> = {};
  const wss = new WebSocketServer<AliveWebSocket>({ server });
  const routeHandlers: RouteHandler[] = [];

  function ping() {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }

  // Every 30s ping all connected clients to make sure they are alive.
  setInterval(ping, 30_000);

  wss.on("connection", (ws) => {
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (rawData) => {
      const path = rawData.toString();

      if (path.startsWith("/")) {
        for (let i = 0; i < routeHandlers.length; i++) {
          const handler = routeHandlers[i](path);
          if (handler) {
            handler(ws);
            return;
          }
        }
      } else {
        const handler = eventHandlers[path];
        if (handler) {
          handler(ws);
        }
      }
    });
  });

  function route<
    TData,
    TRoute extends `/${string}`,
    TRouteParams extends RouteParams<TRoute>,
  >(
    opts: (RouteOpts & { path: TRoute }) | TRoute,
    cb: (
      params: TRouteParams,
      state: { type: "push" | "pull" },
    ) => Promise<TData> | TData,
    pushConstructor?: (
      push: () => void,
      params: TRouteParams,
    ) => Promise<void> | void,
  ): Record<TRoute, { data: TData; params: TRouteParams }> {
    const handler = (path: string) => {
      const route = typeof opts === "string" ? opts : opts.path;
      const config: RouteOpts = typeof opts === "string" ? {} : opts;
      const matches = match(route, path);

      if (matches.matches) {
        return async (ws: WebSocket) => {
          const params: TRouteParams = decodeParams(
            matches.params,
          ) as TRouteParams;

          async function sendMessage(type: "push" | "pull") {
            let data;

            try {
              if (config.defer) {
                await new Promise((resolve) => {
                  setImmediate(resolve);
                });
              }

              data = await cb(params, { type });
            } catch (error) {
              if (error instanceof Error) {
                ws.send(
                  JSON.stringify({ error: error.stack || error.message }),
                );
              } else {
                ws.send(JSON.stringify({ error }));
              }

              return ws.terminate();
            }

            ws.send(stringifyJSON(data));
          }

          sendMessage("pull");

          if (pushConstructor) {
            try {
              await pushConstructor(() => sendMessage("push"), params);
            } catch (error) {
              if (error instanceof Error) {
                ws.send(
                  JSON.stringify({ error: error.stack || error.message }),
                );
              } else {
                ws.send(JSON.stringify({ error }));
              }

              return ws.terminate();
            }
          }
        };
      }

      return false;
    };

    routeHandlers.push(handler);

    // This is opaque, purely used to return what the types are.
    // Accessing it at runtime won't do anything.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any;
  }

  function createEvent<TRoute extends string, TData>(
    eventName: TRoute,
    init: (sendEvent: (data: TData) => void) => Promise<void> | void,
  ): Record<TRoute, { data: TData }> {
    const handler = (ws: WebSocket) => {
      async function sendEvent(data: TData) {
        ws.send(stringifyJSON(data));
      }

      init(sendEvent);
    };

    if (eventHandlers[eventName]) {
      throw new Error(`invariant: ${eventName} already declared`);
    }

    eventHandlers[eventName] = handler;

    // This is opaque, purely used to return what the types are.
    // Accessing it at runtime won't do anything.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any;
  }

  return {
    close() {
      wss.close();
      server.close();
    },
    collectTypes,
    createEvent,
    listen(port: number) {
      server.listen(port);
    },
    route,
  };
}
