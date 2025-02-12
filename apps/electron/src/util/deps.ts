/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir } from "node:fs/promises";
import { Notification, type BrowserWindow } from "electron";
import { createPkgManagerDialog } from "./dialog";
import { exec } from "./exec";
import { indeterminate } from "./progress-bar";

export async function ensureDepsInstall(
  cwd: string,
  window: BrowserWindow,
  signal: AbortSignal,
) {
  const dir = await readdir(cwd);
  if (
    dir.includes("node_modules") ||
    // Skip deps check in a test environment else it will hang indefinitely.
    process.env.FORCE_EDITOR_TEST_FIXTURE
  ) {
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
