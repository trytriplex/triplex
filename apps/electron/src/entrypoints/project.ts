import { startProject } from "../util/project";
import { logger } from "../util/log";

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
