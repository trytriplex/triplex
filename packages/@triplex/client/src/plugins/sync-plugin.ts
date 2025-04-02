/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  type ClientSendEventData,
  type ClientSendEventName,
} from "@triplex/bridge/client";
import { noop } from "@triplex/lib";

export type OnSyncEvent = <TEvent extends ClientSendEventName>(e: {
  data: ClientSendEventData[TEvent];
  name: TEvent;
}) => void;

export function syncPlugin({
  onSyncEvent = noop,
}: {
  onSyncEvent?: OnSyncEvent;
}) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.ws.on("triplex:element-set-prop", (data: any) => {
        onSyncEvent({ data, name: "element-set-prop" });
      });
    },
    name: "triplex:sync-plugin",
  } as const;
}
