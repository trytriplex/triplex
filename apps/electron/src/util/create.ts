// eslint-disable-next-line import/no-extraneous-dependencies
import { type BrowserWindow, dialog, Notification } from "electron";
import { basename } from "node:path";
import { create } from "create-triplex-project";
import { indeterminate } from "./progress-bar";

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
  const complete = indeterminate(window);

  try {
    new Notification({
      title: "Creating Triplex project",
      body: "Hold tight we're creating your new project and installing dependencies.",
    }).show();

    window.webContents.send("window-state-change", "disabled");
    await create({ name, cwd: path });
  } finally {
    window.webContents.send("window-state-change", "active");
    complete();
  }
}
