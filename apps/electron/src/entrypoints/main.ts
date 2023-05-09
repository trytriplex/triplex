import * as Sentry from "@sentry/electron/main";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { autoUpdater } from "electron-updater";
import { fork } from "../util/fork";
import { logger } from "../util/log";

if (process.env.TRIPLEX_ENV !== "development") {
  Sentry.init({
    dsn: "https://2dda5a93222a45468f0d672d11f356a7@o4505148024356864.ingest.sentry.io/4505148028092416",
  });
}

const log = logger("main");
autoUpdater.logger = logger("auto-update");

function prepareMenu() {
  const listeners: ((id: string) => void)[] = [];

  const appMenu = {
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
  } satisfies MenuItemConstructorOptions;

  const defaultFileMenu = {
    role: "fileMenu",
    submenu: [
      {
        label: "Open Project...",
        id: "open-project",
      },
      { type: "separator" },
      {
        label: "Close Project",
        id: "close-project",
        enabled: false,
      },
    ],
  } satisfies MenuItemConstructorOptions;

  function setMenuClickHandlers() {
    const menu = Menu.getApplicationMenu();
    const menuItems = menu?.items || [];

    function setHandler(menuItems: Electron.MenuItem[]) {
      for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];

        if (menuItem.id) {
          menuItem.click = () => {
            listeners.forEach((listener) => {
              listener(menuItem.id);
            });
          };
        }

        if (menuItem.submenu) {
          setHandler(menuItem.submenu.items);
        }
      }
    }

    setHandler(menuItems);
  }

  function resetMenu() {
    const defaultMenu = Menu.buildFromTemplate([appMenu, defaultFileMenu]);
    Menu.setApplicationMenu(defaultMenu);
    setMenuClickHandlers();
  }

  resetMenu();

  return {
    onMenuItemPress(callback: (id: string) => void) {
      const index = listeners.push(callback);

      return () => {
        listeners.splice(index, 1);
      };
    },
    resetMenu,
    connectMenuToRenderer(activeWindow: BrowserWindow) {
      const callback = (_: unknown, data: MenuItemConstructorOptions[]) => {
        Menu.setApplicationMenu(Menu.buildFromTemplate([appMenu, ...data]));
        setMenuClickHandlers();
      };

      activeWindow.webContents.ipc.on("set-menu-bar", callback);

      return () => {
        activeWindow.webContents.ipc.off("set-menu-bar", callback);
      };
    },
  };
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

function main() {
  let activeWindow: BrowserWindow | undefined;
  let cleanup: (() => void) | undefined;

  const { onMenuItemPress, resetMenu, connectMenuToRenderer } = prepareMenu();

  function onCloseProject() {
    cleanup?.();
    activeWindow?.close();
    activeWindow = undefined;
    cleanup = undefined;
    resetMenu();
  }

  async function onOpenProject() {
    const cwd = await openProjectDialog();
    if (cwd) {
      log.info("selected", cwd);

      if (cleanup) {
        cleanup?.();
        cleanup = undefined;
      }

      if (!activeWindow) {
        activeWindow = new BrowserWindow({
          backgroundColor: "#171717",
          titleBarStyle: "hidden",
          titleBarOverlay: {
            height: 32,
          },
          webPreferences: {
            preload: require.resolve("./preload.js"),
          },
          width: 1028,
          height: 768,
        });

        connectMenuToRenderer(activeWindow);
      }

      log.info("forking");

      const p = await fork(join(__dirname, "./project.ts"), { cwd });

      cleanup = () => {
        p.kill();
      };

      if (process.env.TRIPLEX_ENV === "development") {
        const { createDevServer } = require("@triplex/editor");
        const editorPort = 5754;
        const devServer = await createDevServer();

        await devServer.listen(editorPort);
        await activeWindow.loadURL(`http://localhost:${editorPort}`);
      } else {
        await activeWindow.loadFile(
          require.resolve("@triplex/editor/dist/index.html")
        );
      }

      if (process.env.TRIPLEX_ENV === "development") {
        activeWindow.webContents.openDevTools();
      }
    }
  }

  onMenuItemPress((menuItemId) => {
    switch (menuItemId) {
      case "open-project":
        onOpenProject();
        break;

      case "close-project":
        onCloseProject();
        break;

      case "documentation":
        shell.openExternal("https://triplex.dev/docs");
        break;

      case "devtools":
        activeWindow?.webContents.openDevTools();
        break;

      default: {
        if (activeWindow) {
          // Send the event to the current active window.
          activeWindow.webContents.send("menu-item-press", menuItemId);
        }

        break;
      }
    }
  });
}

main();

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
  app.focus({ steal: process.env.TRIPLEX_ENV === "development" });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
