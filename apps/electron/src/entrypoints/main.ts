import * as Sentry from "@sentry/electron/main";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
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
import { ensureDepsInstall } from "../util/deps";

if (process.env.TRIPLEX_ENV !== "development") {
  Sentry.init({
    dsn: "https://2dda5a93222a45468f0d672d11f356a7@o4505148024356864.ingest.sentry.io/4505148028092416",
  });
}

const EDITOR_DEV_PORT = 5754;
const log = logger("main");

autoUpdater.logger = logger("auto-update");

// Stub out the menu ASAP to prevent a flash.
// It is filled in after the electron app is ready.
Menu.setApplicationMenu(
  Menu.buildFromTemplate(
    process.platform === "darwin"
      ? [{ role: "appMenu" }, { role: "fileMenu" }]
      : [{ role: "fileMenu" }]
  )
);

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
    const defaultMenu = Menu.buildFromTemplate(
      process.platform === "darwin"
        ? [appMenu, defaultFileMenu]
        : [defaultFileMenu]
    );
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
        const menu = Menu.buildFromTemplate(
          process.platform === "darwin" ? [appMenu, ...data] : data
        );

        Menu.setApplicationMenu(menu);
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

async function showSaveDialog(
  activeWindow: BrowserWindow,
  defaultPath: string
) {
  const { filePath } = await dialog.showSaveDialog(activeWindow, {
    properties: ["showOverwriteConfirmation", "dontAddToRecent"],
    defaultPath,
  });

  return filePath;
}

function applyWindowIpcHandlers(activeWindow: BrowserWindow) {
  activeWindow.webContents.ipc.handle(
    "show-save-dialog",
    (_, filename: string) => {
      return showSaveDialog(activeWindow, filename);
    }
  );
}

async function openWelcomeScreen() {
  const window = new BrowserWindow({
    backgroundColor: "#171717",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      height: 32,
    },
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: require.resolve("./preload.js"),
    },
    width: 520,
    height: 408,
  });

  if (process.env.TRIPLEX_ENV === "development") {
    await window.loadURL(`http://localhost:${EDITOR_DEV_PORT}/welcome.html`);
  } else {
    await window.loadFile(require.resolve("@triplex/editor/dist/welcome.html"));
  }

  return window;
}

async function main() {
  const { onMenuItemPress, resetMenu, connectMenuToRenderer } = prepareMenu();

  let activeWindow: BrowserWindow | undefined;
  let welcomeWindow: BrowserWindow | undefined;
  let cleanup: (() => void) | undefined;

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
        activeWindow?.close();
        activeWindow = undefined;
      }

      activeWindow = new BrowserWindow({
        backgroundColor: "#171717",
        titleBarStyle: process.platform === "darwin" ? "hidden" : "default",
        show: false,
        paintWhenInitiallyHidden: false,
        titleBarOverlay: {
          height: 32,
        },
        webPreferences: {
          preload: require.resolve("./preload.js"),
        },
        width: 1028,
        height: 768,
      });

      if (!(await ensureDepsInstall(cwd, activeWindow))) {
        await dialog.showErrorBox(
          "Could not install dependencies",
          "Please ensure your package manager is installed and functional."
        );
        return;
      }

      activeWindow.show();

      connectMenuToRenderer(activeWindow);
      applyWindowIpcHandlers(activeWindow);

      log.info("forking");

      const p = await fork(join(__dirname, "./project.ts"), { cwd });

      cleanup = () => {
        p.kill();
      };

      const searchParams = `?path=${p.data?.path}&exportName=${p.data?.exportName}`;

      if (process.env.TRIPLEX_ENV === "development") {
        await activeWindow.loadURL(
          `http://localhost:${EDITOR_DEV_PORT}${searchParams}`
        );
      } else {
        await activeWindow.loadFile(
          require.resolve(`@triplex/editor/dist/index.html`),
          {
            search: searchParams,
          }
        );
      }

      if (process.env.TRIPLEX_ENV === "development") {
        activeWindow.webContents.openDevTools();
      }

      return true;
    }

    return false;
  }

  function applyGlobalIpcHandlers() {
    ipcMain.on("open-link", (_, url: string) => {
      shell.openExternal(url);
    });

    ipcMain.on("send-command", async (_, id: string) => {
      switch (id) {
        case "open-project":
          if ((await onOpenProject()) && welcomeWindow) {
            welcomeWindow.close();
            welcomeWindow = undefined;
          }
          break;

        default:
          break;
      }
    });
  }

  if (process.env.TRIPLEX_ENV === "development") {
    const { createDevServer } = require("@triplex/editor");
    const devServer = await createDevServer();
    await devServer.listen(EDITOR_DEV_PORT);
  }

  welcomeWindow = await openWelcomeScreen();

  applyGlobalIpcHandlers();

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

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
  main();
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
