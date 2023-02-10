import { WebSocketServer } from "ws";
import { RouteParams } from "@oakserver/oak";
import { match } from "node-match-path";

function decodeParams(params?: Record<string, string> | null) {
  if (!params) {
    return {};
  }

  const newParams = { ...params };

  for (let key in newParams) {
    newParams[key] = decodeURIComponent(newParams[key]);
  }

  return newParams;
}

export function createServer() {
  const wss = new WebSocketServer({ port: 3300 });

  function message<
    TData extends any,
    R extends string,
    P extends RouteParams<R> = RouteParams<R>
  >(
    route: R,
    cb: (params: P) => Promise<TData> | TData,
    pushConstructor?: (push: () => void, params: P) => void
  ) {
    wss.on("connection", (ws) => {
      let prevSend: string;

      ws.on("message", (rawData) => {
        const path = rawData.toString();
        const matches = match(route, path);

        if (matches.matches) {
          const params: P = decodeParams(matches.params) as P;

          async function pushMessageToClient() {
            let data;

            try {
              data = await cb(params);
            } catch (e) {
              if (e instanceof Error) {
                data = { error: e.message };
              } else {
                data = { error: e };
              }
            }

            const stringifiedData = JSON.stringify(data);

            if (prevSend !== stringifiedData) {
              ws.send(stringifiedData);
              prevSend = stringifiedData;
            }
          }

          pushMessageToClient();

          if (pushConstructor) {
            pushConstructor(pushMessageToClient, params);
          }
        }
      });
    });
  }

  return {
    message,
  };
}
