/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "create-triplex-project";
import { dialog, Notification, type BrowserWindow } from "electron";
import { basename } from "upath";
import { createPkgManagerDialog } from "./dialog";
import { env } from "./env";
import { indeterminate } from "./progress-bar";

export async function showCreateDialog(browserWindow: BrowserWindow) {
  const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
    buttonLabel: "Create",
    properties: ["createDirectory", "openDirectory"],
  });

  if (canceled || !filePaths[0]) {
    return undefined;
  }

  return filePaths[0];
}

export async function createProject(window: BrowserWindow, path: string) {
  const name = basename(path);

  let command: "npm" | "yarn" | "pnpm";

  const result = await createPkgManagerDialog(window, {
    detail: "If you're unsure select npm.",
    message: "Select a package manager",
  });

  if (result === false) {
    return false;
  }

  command = result;

  const complete = indeterminate(window);

  new Notification({
    body: "Hold tight we're creating your new project and installing dependencies.",
    title: "Creating project",
  }).show();

  window.webContents.send("window-state-change", "disabled");

  try {
    await create({
      cwd: path,
      env,
      name,
      packageManager: command,
    });
    return true;
  } finally {
    window.webContents.send("window-state-change", "active");
    await complete();
  }
}
