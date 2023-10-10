/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { exec as execCb } from "node:child_process";
import { env } from "./env";

export async function exec(
  cmd: string,
  { cwd, signal }: { cwd?: string; signal?: AbortSignal }
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
      }
    );
  });
}
