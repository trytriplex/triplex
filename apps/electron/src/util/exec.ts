/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { exec as execCb } from "node:child_process";
import { env } from "./env";

export async function exec(
  cmd: string,
  { cwd, signal }: { cwd?: string; signal?: AbortSignal },
) {
  return new Promise<void>((resolve, reject) => {
    execCb(
      cmd,
      {
        cwd,
        env,
        signal,
      },
      (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      },
    );
  });
}
