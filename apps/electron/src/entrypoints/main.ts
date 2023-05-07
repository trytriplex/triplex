// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, dialog, Menu } from "electron";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { fork } from "../util/fork";
import { logger } from "../util/log";

const log = logger("main");

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
  let cleanup: (() => void) | undefined;

  const menu = buildMenu({
    async onOpenProject() {
      const cwd = await openProjectDialog();
      if (cwd) {
        log("selected", cwd);

        if (cleanup) {
          cleanup?.();
          cleanup = undefined;
        }

        if (!currentWindow) {
          currentWindow = new BrowserWindow({
            backgroundColor: "#171717",
            webPreferences: {},
            width: 1028,
            height: 768,
          });
        }

        log("forking");

        const p = await fork(join(__dirname, "./project.ts"), { cwd });

        cleanup = () => {
          p.kill();
        };

        if (process.env.TRIPLEX_ENV === "development") {
          const { createDevServer } = require("@triplex/editor");
          const editorPort = 5754;
          const devServer = await createDevServer();

          await devServer.listen(editorPort);
          await currentWindow.loadURL(`http://localhost:${editorPort}`);
        } else {
          await currentWindow.loadFile(
            require.resolve("@triplex/editor/dist/index.html")
          );
        }

        if (
          process.env.TRIPLEX_ENV === "development" ||
          process.env.NODE_ENV?.includes("triplex")
        ) {
          currentWindow.webContents.openDevTools();
        }
      }
    },
    onCloseProject() {
      cleanup?.();
      currentWindow?.close();
      currentWindow = undefined;
      cleanup = undefined;
    },
  });

  Menu.setApplicationMenu(menu);

  app.focus({ steal: process.env.TRIPLEX_ENV === "development" });
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
