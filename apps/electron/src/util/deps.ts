import { readdir } from "node:fs/promises";
import { exec } from "node:child_process";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow } from "electron";
import { logger } from "./log";
import { indeterminate } from "./progress-bar";

const log = logger("deps");

async function install(
  cmd: string,
  { signal, cwd }: { cwd: string; signal: AbortSignal }
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    exec(`${cmd} install`, { cwd, signal }, (err) => {
      if (err) {
        log.error(`There was an error installing deps with ${cmd}`);
        log.error(err);
        resolve(false);
      }
      resolve(true);
    });
  });
}

export async function ensureDepsInstall(
  cwd: string,
  window: BrowserWindow,
  signal: AbortSignal
) {
  const dir = await readdir(cwd);
  if (dir.includes("node_modules")) {
    return true;
  }

  const complete = indeterminate(window, signal);

  let success: boolean;

  if (dir.includes("yarn.lock")) {
    success = await install("yarn", { cwd, signal });
  } else if (dir.includes("pnpm-lock.yaml")) {
    success = await install("pnpm", { cwd, signal });
  } else {
    success = await install("npm", { cwd, signal });
  }

  complete();

  return success;
}
