/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readdir } from "node:fs/promises";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Notification } from "electron";
import { createPkgManagerDialog } from "./dialog";
import { exec } from "./exec";
import { indeterminate } from "./progress-bar";

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
      detail:
        "We couldn't detect the package manager to use, if you're unsure select npm.",
      message: "Select a package manager",
    });
    if (result === false) {
      return false;
    }

    command = result;
  }

  const complete = indeterminate(window, signal);

  new Notification({
    body: "Hold tight we're installing dependencies for your project.",
    title: "Installing dependencies",
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
    await complete();
  }
}
