import { readdir } from "node:fs/promises";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Notification } from "electron";
import { exec } from "./exec";
import { indeterminate } from "./progress-bar";
import { createPkgManagerDialog } from "./dialog";

export async function ensureDepsInstall(
  cwd: string,
  window: BrowserWindow,
  signal: AbortSignal
) {
  const dir = await readdir(cwd);
  if (dir.includes("node_modules")) {
    return true;
  }

  let command: "npm" | "yarn" | "pnpm";

  if (dir.includes("yarn.lock")) {
    command = "yarn";
  } else if (dir.includes("pnpm-lock.yaml")) {
    command = "pnpm";
  } else if (dir.includes("package-lock.json")) {
    command = "npm";
  } else {
    // Unknown package manager, ask what package manager to use.
    const result = await createPkgManagerDialog(window, {
      message: "Select a package manager",
      detail:
        "We couldn't detect the package manager to use, if you're unsure select npm.",
    });
    if (result === false) {
      return false;
    }

    command = result;
  }

  const complete = indeterminate(window, signal);

  new Notification({
    title: "Installing dependencies",
    body: "Hold tight we're installing dependencies for your project.",
  }).show();

  window.webContents.send("window-state-change", "disabled");

  try {
    await exec(`${command} install`, {
      cwd,
      signal,
    });

    return true;
  } finally {
    window.webContents.send("window-state-change", "active");
    complete();
  }
}
