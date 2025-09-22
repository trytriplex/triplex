/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { init, setTag } from "@sentry/node";
import { createServer as createClientServer } from "@triplex/client";
import { createForkLogger } from "@triplex/lib/log";
import { type FGEnvironment } from "@triplex/lib/types";
import {
  createServer,
  type ReconciledRenderer,
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";

const log = createForkLogger("triplex:fork_process");

export type Args = {
  config: ReconciledTriplexConfig;
  cwd: string;
  fgEnvironmentOverride: FGEnvironment;
  isTelemetryEnabled: boolean;
  ports: TriplexPorts;
  renderer: ReconciledRenderer;
  userId: string;
};

async function main() {
  log.debug("init");
  const cleanupFunctions: (() => void)[] = [];

  if (!process.env.TRIPLEX_DATA) {
    throw new Error("invariant: env.TRIPLEX_DATA environment data missing");
  }

  const data: Args = JSON.parse(process.env.TRIPLEX_DATA);

  init({
    dsn: "https://cae61a2a840cbbe7f17e240c99ad0346@o4507990276177920.ingest.us.sentry.io/4507990321725440",
    enabled: data.isTelemetryEnabled,
    environment: data.fgEnvironmentOverride,
  });

  setTag("name", "fork_process");

  log.debug("start server");
  const server = await createServer(data);
  cleanupFunctions.push(await server.listen(data.ports));

  log.debug("start client");
  const client = await createClientServer({
    ...data,
    onSyncEvent: (e) => {
      process.send?.({
        data: e.data,
        eventName: `sync:${e.name}`,
      });
    },
  });
  cleanupFunctions.push(await client.listen(data.ports));

  log.debug("ready");
  process.send?.({
    eventName: "ready",
  });
}

main();
