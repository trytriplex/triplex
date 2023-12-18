/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer } from "node:http";
import { match } from "node-match-path";
import { WebSocketServer, type WebSocket } from "ws";
import { stringifyJSON } from "./string";

export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

interface RouteOpts {
  defer?: boolean;
}

type ValidateShape<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

type ExtractParams<TRoute extends string> =
  TRoute extends `${infer TStart}/${infer TEnd}`
    ? ExtractParams<TStart> & ExtractParams<TEnd>
    : TRoute extends `:${infer TParam}`
    ? { [P in TParam]: string }
    : // eslint-disable-next-line @typescript-eslint/ban-types
      {};

export type RouteParams<TRoute extends string> = ValidateShape<
  ExtractParams<TRoute>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
> extends never
  ? ExtractParams<TRoute>
  : never;

function decodeParams(params?: Record<string, string> | null) {
  if (!params) {
    return {};
  }

  const newParams = { ...params };

  for (const key in newParams) {
    newParams[key] = decodeURIComponent(newParams[key]);
  }

  return newParams;
}

interface AliveWebSocket extends WebSocket {
  isAlive: boolean;
}

function collectTypes<TRoutes extends Array<Record<string, unknown>>>(
  _: TRoutes
): UnionToIntersection<TRoutes[number]> {
  // This is opaque, purely used to return what the types are.
  // Accessing it at runtime won't do anything.
  return {} as UnionToIntersection<TRoutes[number]>;
}

export function createTWS() {
  const server = createServer();
  const wss = new WebSocketServer<AliveWebSocket>({ server });
  const routeHandlers: ((
    path: string
  ) => ((ws: WebSocket) => Promise<void>) | false)[] = [];
  const eventHandlers: Record<string, (ws: WebSocket) => void> = {};

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
    TRouteParams extends RouteParams<TRoute>
  >(
    opts: (RouteOpts & { path: TRoute }) | TRoute,
    cb: (
      params: TRouteParams,
      state: { type: "push" | "pull" }
    ) => Promise<TData> | TData,
    pushConstructor?: (
      push: () => void,
      params: TRouteParams
    ) => Promise<void> | void
  ): Record<TRoute, { data: TData; params: TRouteParams }> {
    const handler = (path: string) => {
      const route = typeof opts === "string" ? opts : opts.path;
      const config: RouteOpts = typeof opts === "string" ? {} : opts;
      const matches = match(route, path);

      if (matches.matches) {
        return async (ws: WebSocket) => {
          const params: TRouteParams = decodeParams(
            matches.params
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
                  JSON.stringify({ error: error.stack || error.message })
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
                  JSON.stringify({ error: error.stack || error.message })
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
    init: (sendEvent: (data: TData) => void) => Promise<void> | void
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
