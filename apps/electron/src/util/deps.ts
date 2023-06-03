import { readdir } from "node:fs/promises";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Notification } from "electron";
import { exec } from "./exec";
import { indeterminate } from "./progress-bar";

async function install(
  cmd: string,
  { signal, cwd }: { cwd: string; signal: AbortSignal }
) {
  return exec(`${cmd} install`, {
    cwd,
    signal,
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

  try {
    new Notification({
      title: "Installing dependencies",
      body: "Hold tight we're installing dependencies for your project.",
    }).show();

    if (dir.includes("yarn.lock")) {
      await install("yarn", { cwd, signal });
    } else if (dir.includes("pnpm-lock.yaml")) {
      await install("pnpm", { cwd, signal });
    } else {
      await install("npm", { cwd, signal });
    }
  } finally {
    complete();
  }
}
