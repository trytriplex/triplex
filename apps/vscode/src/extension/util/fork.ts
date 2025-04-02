/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { fork as forkChild } from "node:child_process";
import { join } from "@triplex/lib/path";
import { logFromFork, logger } from "../../util/log/vscode";

const log = logger("fork_parent");

/**
 * Forks a sub-process that points to an entrypoint. The entrypoint must call
 * `process.send({ eventName: 'ready' })` when ready to have this fork resolve
 * its promise.
 */
export function fork<TData extends Record<string, unknown>>(
  filename: string,
  { cwd, data }: { cwd: string; data: TData & { cwd: string } },
): Promise<{
  data?: Record<string, unknown>;
  kill(): void;
  on(
    eventName: string,
    data: (data: Record<string, unknown>) => void,
  ): () => void;
  send(eventName: string, data: Record<string, unknown>): void;
}> {
  const messageCallbacks: Record<
    string,
    (obj: Record<string, unknown>) => void
  > = {};
  let fork: ReturnType<typeof forkChild>;

  if (process.env.TRIPLEX_ENV === "development") {
    log.debug("Starting project (dev)...");

    fork = forkChild(filename, ["--inspect-port=0"], {
      cwd: data.cwd,
      env: {
        FG_ENVIRONMENT_OVERRIDE: process.env.FG_ENVIRONMENT_OVERRIDE,
        NODE_OPTIONS: `-r ${join(cwd, "hook-fork.js")}`,
        NODE_PATH: cwd,
        TRIPLEX_DATA: JSON.stringify(data),
        TRIPLEX_ENV: "development",
        VITE_CJS_IGNORE_WARNING: "true",
        VITE_FG_OVERRIDES: process.env.VITE_FG_OVERRIDES,
        VITE_TRIPLEX_ENV: process.env.VITE_TRIPLEX_ENV || "development",
      },
      // We set the forked process to silent so we can capture errors.
      // See: https://stackoverflow.com/a/52066025
      silent: true,
    });
  } else {
    log.debug("Starting project...");
    fork = forkChild(filename.replace(".ts", ".js"), [], {
      cwd: data.cwd,
      env: {
        DEBUG: "triplex",
        FG_ENVIRONMENT_OVERRIDE: process.env.FG_ENVIRONMENT_OVERRIDE,
        NODE_PATH: cwd,
        TRIPLEX_DATA: JSON.stringify(data),
        TRIPLEX_ENV: "production",
        VITE_CJS_IGNORE_WARNING: "true",
        VITE_TRIPLEX_ENV: "production",
      },
      // We set the forked process to silent so we can capture errors.
      // See: https://stackoverflow.com/a/52066025
      silent: true,
    });
  }

  logFromFork(fork);

  process.once("SIGINT", () => {
    fork.kill("SIGINT");
  });
  process.once("SIGTERM", () => {
    fork.kill("SIGTERM");
  });

  return new Promise((resolve, reject) => {
    fork.on("error", (e) => {
      reject(e);
      log.error("Error", e);
    });

    fork.stderr?.on("data", (data) => {
      const err = data.toString();
      if (err.includes("inspector")) {
        // Ignore inspector errors.
        return;
      }

      reject(err);

      log.debug(err);
    });

    fork.on("message", (e) => {
      const eventObject = e as {
        data?: Record<string, unknown>;
        eventName: string;
      };

      if (eventObject.eventName === "ready") {
        log.debug("Started.");

        resolve({
          data: eventObject.data,
          kill() {
            if (!fork.kill("SIGTERM")) {
              // eslint-disable-next-line no-console
              log.debug("Project fork could not be terminated.");
            }
          },
          on(
            eventName: string,
            callback: (data: Record<string, unknown>) => void,
          ) {
            messageCallbacks[eventName] = callback;
            return () => {
              delete messageCallbacks[eventName];
            };
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
