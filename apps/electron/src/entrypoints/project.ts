/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { init } from "@sentry/node";
import { type FGEnvironment } from "@triplex/lib/types";
import {
  type ReconciledRenderer,
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";
import { logger } from "../util/log";
import { startProject } from "../util/project";

if (process.env.NODE_ENV !== "development") {
  init({
    dsn: "https://465c2b265422fda6d76957f5a4854ffb@o4507990276177920.ingest.us.sentry.io/4507990300229632",
  });
}

const log = logger("project");

async function main() {
  log.info("start project", process.cwd());

  try {
    if (!process.env.TRIPLEX_DATA) {
      throw new Error("invariant: env.TRIPLEX_DATA environment data missing");
    }

    const data: {
      config: ReconciledTriplexConfig;
      fgEnvironmentOverride: FGEnvironment;
      ports: TriplexPorts;
      renderer: ReconciledRenderer;
      userId: string;
    } = JSON.parse(process.env.TRIPLEX_DATA);

    await startProject(data);

    process.send?.({
      eventName: "ready",
    });
  } catch (error) {
    const err = error as Error;

    log.error(err.message);

    throw error;
  }
}

main();
