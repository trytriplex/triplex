/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { init } from "@sentry/node";
import {
  type ReconciledRenderer,
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";
import { logger } from "../util/log";
import { startProject } from "../util/project";

if (process.env.TRIPLEX_ENV !== "development") {
  init({
    dsn: "https://2dda5a93222a45468f0d672d11f356a7@o4505148024356864.ingest.sentry.io/4505148028092416",
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
      ports: TriplexPorts;
      renderer: ReconciledRenderer;
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
