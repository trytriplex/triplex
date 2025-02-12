/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { init } from "@sentry/node";
import { createServer as createClientServer } from "@triplex/client";
import {
  createServer,
  type ReconciledRenderer,
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";
import { logger } from "../util/log/fork";

const log = logger("fork_process");

export type Args = {
  config: ReconciledTriplexConfig;
  cwd: string;
  fgEnvironmentOverride: "production" | "staging" | "development" | "local";
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

  if (process.env.NODE_ENV === "production" && data.isTelemetryEnabled) {
    init({
      dsn: "https://cae61a2a840cbbe7f17e240c99ad0346@o4507990276177920.ingest.us.sentry.io/4507990321725440",
    });
  }

  log.debug("start server");
  const server = await createServer(data);
  cleanupFunctions.push(await server.listen(data.ports));

  log.debug("start client");
  const client = await createClientServer(data);
  cleanupFunctions.push(await client.listen(data.ports.client));

  log.debug("ready");
  process.send?.({
    eventName: "ready",
  });
}

main();
