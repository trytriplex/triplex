/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { fork as forkChild } from "node:child_process";
import { join } from "upath";
import { logger } from "../../util/log/vscode";

const log = logger("project");

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
  on(eventName: string, data: (data: Record<string, unknown>) => void): void;
  send(eventName: string, data: Record<string, unknown>): void;
}> {
  const messageCallbacks: Record<
    string,
    (obj: Record<string, unknown>) => void
  > = {};
  let fork: ReturnType<typeof forkChild>;

  if (process.env.TRIPLEX_ENV === "development") {
    log("Starting project (dev)...");

    fork = forkChild(filename, ["--inspect-port=0"], {
      cwd: data.cwd,
      env: {
        FG_ENVIRONMENT_OVERRIDE: process.env.FG_ENVIRONMENT_OVERRIDE,
        NODE_OPTIONS: `-r ${join(cwd, "hook-fork.js")}`,
        NODE_PATH: cwd,
        TRIPLEX_DATA: JSON.stringify(data),
        TRIPLEX_ENV: "development",
        VITE_CJS_IGNORE_WARNING: "true",
        VITE_TRIPLEX_ENV: process.env.VITE_TRIPLEX_ENV || "development",
      },
      // We set the forked process to silent so we can capture errors.
      // See: https://stackoverflow.com/a/52066025
      silent: true,
    });
  } else {
    log("Starting project...");
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

  return new Promise((resolve, reject) => {
    fork.on("error", (e) => {
      reject(e);
      log("Error", e);
    });

    fork.stderr?.on("data", (data) => {
      const err = data.toString();
      if (err.includes("inspector")) {
        // Ignore inspector errors.
        return;
      }

      reject(err);
      log("Error", err);
    });

    fork.on("message", (e) => {
      const eventObject = e as {
        data?: Record<string, unknown>;
        eventName: string;
      };

      if (eventObject.eventName === "ready") {
        log("Started.", eventObject.data);

        resolve({
          data: eventObject.data,
          kill() {
            if (!fork.kill("SIGTERM")) {
              // eslint-disable-next-line no-console
              console.error("could not kill fork");
            }
          },
          on(
            eventName: string,
            callback: (data: Record<string, unknown>) => void,
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
