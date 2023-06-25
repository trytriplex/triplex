import { WebSocketServer, WebSocket } from "ws";
import { RouteParams } from "@oakserver/oak";
import { match } from "node-match-path";

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

export function createServer() {
  const wss = new WebSocketServer<AliveWebSocket>({ port: 3300 });
  const routeHandlers: ((
    path: string
  ) => ((ws: WebSocket) => Promise<void>) | false)[] = [];

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
  setInterval(ping, 30000);

  wss.on("connection", (ws) => {
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (rawData) => {
      const path = rawData.toString();

      for (let i = 0; i < routeHandlers.length; i++) {
        const handler = routeHandlers[i](path);
        if (handler) {
          handler(ws);
          return;
        }
      }
    });
  });

  function route<
    TData,
    R extends string,
    P extends RouteParams<R> = RouteParams<R>
  >(
    route: R,
    cb: (params: P, state: { type: "push" | "pull" }) => Promise<TData> | TData,
    pushConstructor?: (push: () => void, params: P) => Promise<void> | void
  ) {
    const handler = (path: string) => {
      const matches = match(route, path);

      if (matches.matches) {
        return async (ws: WebSocket) => {
          const params: P = decodeParams(matches.params) as P;

          async function sendMessage(type: "push" | "pull") {
            let data;

            try {
              data = await cb(params, { type });
            } catch (e) {
              if (e instanceof Error) {
                ws.send(JSON.stringify({ error: e.stack || e.message }));
              } else {
                ws.send(JSON.stringify({ error: e }));
              }

              return ws.terminate();
            }

            ws.send(JSON.stringify(data));
          }

          sendMessage("pull");

          if (pushConstructor) {
            try {
              await pushConstructor(() => sendMessage("push"), params);
            } catch (e) {
              if (e instanceof Error) {
                ws.send(JSON.stringify({ error: e.stack || e.message }));
              } else {
                ws.send(JSON.stringify({ error: e }));
              }

              return ws.terminate();
            }
          }
        };
      }

      return false;
    };

    routeHandlers.push(handler);
  }

  return {
    message: route,
    close: wss.close.bind(wss),
  };
}
