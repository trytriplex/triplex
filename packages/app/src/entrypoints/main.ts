import { app, BrowserWindow, dialog, Menu } from "electron";
import { join } from "path";
import { readdir } from "fs/promises";
import { startProject } from "../util/project";

if (require("electron-squirrel-startup")) {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  app.quit();
}

function buildMenu({
  onOpenProject,
  onCloseProject,
}: {
  onOpenProject(): void;
  onCloseProject(): void;
}) {
  const menu = Menu.buildFromTemplate([
    {
      role: "appMenu",
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      role: "fileMenu",
      submenu: [
        {
          label: "Open Project...",
          click: () => onOpenProject(),
        },
        { type: "separator" },
        {
          label: "Close Project",
          click: () => onCloseProject(),
        },
      ],
    },
  ]);

  return menu;
}

async function openProjectDialog(
  message?: string
): Promise<string | undefined> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    message,
    title: "Open Project",
  });

  const path = filePaths.at(0);

  if (canceled || !path) {
    return undefined;
  } else {
    const dir = await readdir(path);
    if (dir.includes(".triplex")) {
      return path;
    }

    return openProjectDialog("Folder hasn't been initialized with Triplex.");
  }
}

function prepareApp() {
  let currentWindow: BrowserWindow | undefined;
  let closeProject: (() => void) | undefined;

  const menu = buildMenu({
    async onOpenProject() {
      const cwd = await openProjectDialog();
      if (cwd) {
        if (closeProject) {
          closeProject?.();
          closeProject = undefined;
        }

        if (!currentWindow) {
          currentWindow = new BrowserWindow({
            backgroundColor: "#171717",
            webPreferences: {
              preload: join(__dirname, "preload.ts"),
            },
            width: 1028,
            height: 768,
          });

          const project = await startProject(cwd);
          closeProject = project.close;
          currentWindow.loadURL(project.url);
          currentWindow.webContents.openDevTools();
        } else {
          const project = await startProject(cwd);
          closeProject = project.close;
          currentWindow.reload();
        }
      }
    },
    onCloseProject() {
      closeProject?.();
      currentWindow?.close();
      currentWindow = undefined;
      closeProject = undefined;
    },
  });

  Menu.setApplicationMenu(menu);

  app.focus();
}

app.on("ready", prepareApp);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
