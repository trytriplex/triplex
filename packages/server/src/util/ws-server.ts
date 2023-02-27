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

  function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }

  // Every 30s ping all connected clients to make sure they are alive.
  setInterval(ping, 30000);

  function message<
    TData,
    R extends string,
    P extends RouteParams<R> = RouteParams<R>
  >(
    route: R,
    cb: (params: P, state: { type: "push" | "pull" }) => Promise<TData> | TData,
    pushConstructor?: (push: () => void, params: P) => void
  ) {
    wss.on("connection", (ws) => {
      let prevSend: string;

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (rawData) => {
        const path = rawData.toString();
        const matches = match(route, path);

        if (matches.matches) {
          const params: P = decodeParams(matches.params) as P;

          async function pushMessageToClient(type: "push" | "pull") {
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

            const stringifiedData = JSON.stringify(data);

            if (prevSend !== stringifiedData) {
              ws.send(stringifiedData);
              prevSend = stringifiedData;
            }
          }

          pushMessageToClient("pull");

          if (pushConstructor) {
            pushConstructor(() => pushMessageToClient("push"), params);
          }
        }
      });
    });
  }

  return {
    message,
    close: wss.close.bind(wss),
  };
}
