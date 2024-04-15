/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { fork as forkChild } from "node:child_process";
import { app } from "electron";
import { join } from "upath";
import { logger } from "../util/log";

const log = logger("fork");

/**
 * Forks a sub-process that points to an entrypoint. The entrypoint must call
 * `process.send({ eventName: 'ready' })` when ready to have this fork resolve
 * its promise.
 */
export function fork<TData extends Record<string, unknown>>(
  filename: string,
  { cwd, data }: { cwd: string; data: TData }
): Promise<{
  data?: Record<string, unknown>;
  kill(): void;
  on(eventName: string, data: (data: Record<string, unknown>) => void): void;
  send(eventName: string, data: Record<string, unknown>): void;
}> {
  const messageCallbacks: Record<
    string,
    (obj: Record<string, unknown>) => void
  > = {};
  let fork: ReturnType<typeof forkChild>;

  if (process.env.TRIPLEX_ENV === "development") {
    const isDebugInspect = process.argv.includes("--inspect");

    log.info("starting dev");

    fork = forkChild(filename, [], {
      cwd,
      env: {
        NODE_OPTIONS: `-r ${join(process.cwd(), "hook-fork.js")}`,
        NODE_PATH: process.cwd(),
        TRIPLEX_DATA: JSON.stringify(data),
        TRIPLEX_ENV: "development",
        VITE_TRIPLEX_ENV: "development",
      },
      // Pass through inspect if the parent has it enabled.
      execArgv: isDebugInspect ? ["--inspect=40895"] : undefined,
      // We set the forked process to silent so we can capture errors.
      // See: https://stackoverflow.com/a/52066025
      silent: !isDebugInspect,
    });
  } else {
    log.info("starting prod");

    fork = forkChild(filename.replace(".ts", ".js"), [], {
      cwd,
      env: {
        DEBUG: "triplex",
        NODE_PATH: process.cwd(),
        TRIPLEX_DATA: JSON.stringify(data),
        TRIPLEX_ENV: "production",
        VITE_TRIPLEX_ENV: "production",
      },
      // We set the forked process to silent so we can capture errors.
      // See: https://stackoverflow.com/a/52066025
      silent: true,
    });
  }

  app.on("will-quit", () => {
    fork.kill("SIGTERM");
  });

  return new Promise((resolve, reject) => {
    fork.on("error", (e) => {
      log.error(e);
      reject(e);
    });

    fork.stderr?.on("data", (data) => {
      log.error(data.toString());
      reject(data.toString());
    });

    fork.on("message", (e) => {
      const eventObject = e as {
        data?: Record<string, unknown>;
        eventName: string;
      };

      if (eventObject.eventName === "ready") {
        log.info("ready");

        resolve({
          data: eventObject.data,
          kill() {
            if (!fork.kill("SIGTERM")) {
              log.error("could not kill fork");
            }
          },
          on(
            eventName: string,
            callback: (data: Record<string, unknown>) => void
          ) {
            messageCallbacks[eventName] = callback;
          },
          send(eventName: string, data: Record<string, unknown>) {
            fork.send({
              data,
              eventName,
            });
          },
        });
      } else {
        // This means only one callback is supported for now. For now that's all we need,
        // we can come back to it if needed.
        const callback = messageCallbacks[eventObject.eventName];
        if (callback) {
          callback(eventObject.data || {});
        }
      }
    });
  });
}
