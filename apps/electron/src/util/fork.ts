/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { fork as forkChild } from "node:child_process";
import { join } from "node:path";
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
): Promise<{
  data?: Record<string, unknown>;
  kill(): void;
  send(message: Record<string, unknown>): void;
}> {
  let fork: ReturnType<typeof forkChild>;

  if (process.env.TRIPLEX_ENV === "development") {
    log.info("starting dev fork");

    fork = forkChild(filename, [], {
      cwd,
      env: {
        NODE_OPTIONS: `-r ${join(process.cwd(), "hook-fork.js")}`,
        NODE_PATH: process.cwd(),
        TRIPLEX_ENV: "development",
      },
    });
  } else {
    log.info("starting prod fork");

    fork = forkChild(filename.replace(".ts", ".js"), [], {
      cwd,
      env: { DEBUG: "triplex", NODE_PATH: process.cwd() },
    });
  }

  app.on("will-quit", () => {
    fork.kill("SIGTERM");
  });

  return new Promise((resolve) => {
    fork.on("message", (e) => {
      if (typeof e === "object") {
        const eventObject = e as {
          data?: Record<string, unknown>;
          eventName: string;
        };

        if (eventObject.eventName === "ready") {
          resolve({
            data: eventObject.data,
            kill() {
              if (!fork.kill("SIGTERM")) {
                log.error("could not kill fork");
              }
            },
            send(message: Record<string, unknown>) {
              fork.send(message);
            },
          });
        }
      }
    });
  });
}
