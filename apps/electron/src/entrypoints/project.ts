import { startProject } from "../util/project";
import { attachFSLogger, logger } from "../util/log";

const log = logger("project");

async function main() {
  attachFSLogger(process.cwd());

  log("start project", process.cwd());

  try {
    await startProject(process.cwd());
    process.send?.({ eventName: "ready" });
  } catch (e) {
    const err = e as Error;

    log(err.message);

    throw e;
  }
}

main();
