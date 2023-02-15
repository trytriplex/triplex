import { WebSocketServer } from "ws";
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

export function createServer() {
  const wss = new WebSocketServer({ port: 3300 });

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
                ws.send(JSON.stringify({ error: e.message }));
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
  };
}
