import { readdir } from "node:fs/promises";
import { exec } from "node:child_process";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow } from "electron";
import { logger } from "./log";

const log = logger("deps");

function indeterminateProgress(window: BrowserWindow) {
  let timeoutId: NodeJS.Timeout | undefined = undefined;

  function increment(progress: number) {
    if (window.isDestroyed()) {
      return;
    }

    timeoutId = setTimeout(() => {
      let nextProgress = progress + Math.random() * 0.01;
      if (nextProgress > 0.8) {
        nextProgress = progress + Math.random() * 0.001;
      } else if (nextProgress > 0.9) {
        nextProgress = progress + Math.random() * 0.0001;
      }

      window.setProgressBar(nextProgress);
      increment(nextProgress);
    }, 100);
  }

  window.setProgressBar(0);
  increment(0);

  return () => {
    clearTimeout(timeoutId);
    window.setProgressBar(1);
    setTimeout(() => {
      if (window.isDestroyed()) {
        return;
      }

      window.setProgressBar(-1);
    }, 200);
  };
}

async function install(cmd: string, cwd: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    exec(`${cmd} install`, { cwd }, (err) => {
      if (err) {
        log.error(`There was an error installing deps with ${cmd}`);
        log.error(err);
        resolve(false);
      }

      resolve(true);
    });
  });
}

export async function ensureDepsInstall(cwd: string, window: BrowserWindow) {
  const dir = await readdir(cwd);
  if (dir.includes("node_modules")) {
    return true;
  }

  const complete = indeterminateProgress(window);

  let success: boolean;

  if (dir.includes("yarn.lock")) {
    success = await install("yarn", cwd);
  } else if (dir.includes("pnpm-lock.yaml")) {
    success = await install("pnpm", cwd);
  } else {
    success = await install("npm", cwd);
  }

  complete();

  return success;
}
