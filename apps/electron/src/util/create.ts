// eslint-disable-next-line import/no-extraneous-dependencies
import { type BrowserWindow, dialog, Notification } from "electron";
import { basename } from "node:path";
import { create } from "create-triplex-project";
import { env } from "./env";
import { indeterminate } from "./progress-bar";
import { createPkgManagerDialog } from "./dialog";

export async function showCreateDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["createDirectory", "openDirectory"],
    buttonLabel: "Create",
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
    message: "Select a package manager",
    detail: "If you're unsure select npm.",
  });

  if (result === false) {
    return false;
  }

  command = result;

  const complete = indeterminate(window);

  new Notification({
    title: "Creating project",
    body: "Hold tight we're creating your new project and installing dependencies.",
  }).show();

  window.webContents.send("window-state-change", "disabled");

  try {
    await create({
      name,
      env,
      target: "app",
      cwd: path,
      packageManager: command,
    });
    return true;
  } finally {
    window.webContents.send("window-state-change", "active");
    await complete();
  }
}
