import { fork as forkChild } from "node:child_process";
import { join } from "node:path";
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from "electron";
import { logger } from "../util/log";

const log = logger("fork");

/**
 * Forks a sub-process that points to an entrypoint. The entrypoint must call
 * `process.send({ eventName: 'ready' })` when ready to have this fork resolve
 * its promise.
 */
export function fork(
  filename: string,
  { cwd }: { cwd: string }
): Promise<{ send(message: Record<string, unknown>): void; kill(): void }> {
  let fork: ReturnType<typeof forkChild>;

  if (process.env.TRIPLEX_ENV === "development") {
    log.info("starting dev fork");

    fork = forkChild(filename, [], {
      env: {
        NODE_OPTIONS: `-r ${join(process.cwd(), "hook-fork.js")}`,
        NODE_PATH: process.cwd(),
        TRIPLEX_ENV: "development",
      },
      cwd,
    });
  } else {
    log.info("starting prod fork");

    fork = forkChild(filename.replace(".ts", ".js"), [], {
      env: { NODE_PATH: process.cwd(), DEBUG: "triplex" },
      cwd,
    });
  }

  app.on("will-quit", () => {
    fork.kill("SIGTERM");
  });

  return new Promise((resolve) => {
    fork.on("message", (e) => {
      if (typeof e === "object") {
        const eventObject = e as { eventName: string };

        if (eventObject.eventName === "ready") {
          resolve({
            send(message: Record<string, unknown>) {
              fork.send(message);
            },
            kill() {
              if (!fork.kill("SIGTERM")) {
                log.error("could not kill fork");
              }
            },
          });
        }
      }
    });
  });
}
