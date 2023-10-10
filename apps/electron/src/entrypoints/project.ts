/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { init } from "@sentry/node";
import { getFirstFoundFile } from "../util/files";
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
    const { config, sceneUrl, serverUrl, wsUrl } = await startProject(
      process.cwd()
    );
    const file = await getFirstFoundFile({ files: config.files });

    process.send?.({
      data: {
        config,
        exportName: file ? file.exports[0].exportName : "",
        path: file ? file.path : "",
        sceneUrl,
        serverUrl,
        wsUrl,
      },
      eventName: "ready",
    });
  } catch (error) {
    const err = error as Error;

    log.error(err.message);

    throw error;
  }
}

main();
