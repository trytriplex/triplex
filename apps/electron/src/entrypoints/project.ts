import * as Sentry from "@sentry/node";
import { startProject } from "../util/project";
import { logger } from "../util/log";

Sentry.init({
  dsn: "https://2dda5a93222a45468f0d672d11f356a7@o4505148024356864.ingest.sentry.io/4505148028092416",
});

const log = logger("project");

async function main() {
  log.info("start project", process.cwd());

  try {
    await startProject(process.cwd());
    process.send?.({ eventName: "ready" });
  } catch (e) {
    const err = e as Error;

    log.error(err.message);

    throw e;
  }
}

main();
