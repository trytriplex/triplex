import { exec as execCb } from "node:child_process";
import { env } from "./env";

export async function exec(
  cmd: string,
  { signal, cwd }: { signal?: AbortSignal; cwd?: string }
) {
  return new Promise<void>((resolve, reject) => {
    execCb(
      cmd,
      {
        cwd,
        signal,
        env,
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
