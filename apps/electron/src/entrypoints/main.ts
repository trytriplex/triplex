/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import process from "node:process";
import { init } from "@sentry/electron/main";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from "electron";
import { autoUpdater } from "electron-updater";
import launchEditor from "launch-editor";
import { join, resolve, sep } from "upath";
import { createProject, showCreateDialog } from "../util/create";
import { ensureDepsInstall } from "../util/deps";
import { fork } from "../util/fork";
import { getLogPath, logger } from "../util/log";

if (process.env.TRIPLEX_ENV !== "development") {
  init({
    dsn: "https://2dda5a93222a45468f0d672d11f356a7@o4505148024356864.ingest.sentry.io/4505148028092416",
  });
}

const SESSION_ID = randomUUID();
const USER_ID = randomUUID();
const HEADLESS_RUN = process.argv.includes("--headless");
const EDITOR_DEV_PORT = 5754;
const log = logger("main");

autoUpdater.logger = logger("auto-update");

// Stub out the menu ASAP to prevent a flash.
// It is filled in after the electron app is ready.
Menu.setApplicationMenu(null);

if (process.platform === "win32") {
  // This ensures published notifications use the app name on Windows.
  app.setAppUserModelId(app.name);
}

function prepareMenu() {
  const listeners: ((id: string) => void)[] = [];

  const appMenu = {
    label: app.name,
    role: "appMenu",
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
        id: "open-project",
        label: "Open Project...",
      },
      { type: "separator" },
      {
        enabled: false,
        id: "close-project",
        label: "Close Project",
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
    connectMenuToRenderer(activeWindow: BrowserWindow) {
      // eslint-disable-next-line unicorn/consistent-function-scoping
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
    onMenuItemPress(callback: (id: string) => void) {
      const index = listeners.push(callback);

      return () => {
        listeners.splice(index, 1);
      };
    },
    resetMenu,
  };
}

async function findTriplexFolder(path: string): Promise<string | undefined> {
  if (path === sep) {
    // We've traversed all the way up the folder path and found nothing.
    // Bail out!
    return undefined;
  }

  const dir = await readdir(path);
  if (dir.includes(".triplex")) {
    return path;
  }

  return findTriplexFolder(resolve(path, ".."));
}

async function showSaveDialog(
  activeWindow: BrowserWindow,
  defaultPath: string
) {
  const { filePath } = await dialog.showSaveDialog(activeWindow, {
    defaultPath,
    properties: ["showOverwriteConfirmation", "dontAddToRecent"],
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

  activeWindow.webContents.on("before-input-event", (_, input) => {
    if (input.modifiers.length > 0 && input.type === "keyDown") {
      const commands: string[] = [];

      if (input.meta) {
        commands.push("CommandOrCtrl");
      }

      if (input.shift) {
        commands.push("Shift");
      }

      activeWindow.webContents.send(
        `acl:${commands.join("+")}+${input.key.toUpperCase()}`
      );
    }
  });
}

async function openWelcomeScreen() {
  const window = new BrowserWindow({
    backgroundColor: "#171717",
    fullscreenable: false,
    height: 408,
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: !HEADLESS_RUN,
    titleBarOverlay: {
      color: "#171717",
      height: 32,
      symbolColor: "#A3A3A3",
    },
    titleBarStyle: "hidden",
    webPreferences: {
      additionalArguments: [`--userId=${USER_ID}`, `--sessionId=${SESSION_ID}`],
      preload: require.resolve("./preload.js"),
    },
    width: 520,
  });

  await (process.env.TRIPLEX_ENV === "development"
    ? window.loadURL(`http://localhost:${EDITOR_DEV_PORT}/welcome.html`)
    : window.loadFile(require.resolve("@triplex/editor/dist/welcome.html")));

  return window;
}

async function main() {
  const { connectMenuToRenderer, onMenuItemPress, resetMenu } = prepareMenu();

  let activeProjectWindow: BrowserWindow | undefined;
  let welcomeWindow: BrowserWindow | undefined;
  let abortContoller: AbortController | undefined;
  let cleanup: (() => void) | undefined;

  function onCloseProject() {
    cleanup?.();
    activeProjectWindow?.close();
    activeProjectWindow = undefined;
    cleanup = undefined;
    resetMenu();
  }

  async function onOpenProject(cwd: string) {
    log.info("selected", cwd);

    cleanup?.();
    cleanup = undefined;
    activeProjectWindow?.close();
    activeProjectWindow = undefined;
    abortContoller?.abort();
    abortContoller = undefined;

    abortContoller = new AbortController();

    activeProjectWindow = new BrowserWindow({
      backgroundColor: "#171717",
      height: 720,
      show: false,
      titleBarOverlay: {
        color: "#171717",
        height: 32,
        symbolColor: "#A3A3A3",
      },
      titleBarStyle: "hidden",
      webPreferences: {
        additionalArguments: [
          `--userId=${USER_ID}`,
          `--sessionId=${SESSION_ID}`,
        ],
        preload: require.resolve("./preload.js"),
      },
      width: 1280,
    });

    activeProjectWindow.on("blur", () => {
      activeProjectWindow?.webContents.send("window-state-change", "inactive");
    });

    activeProjectWindow.on("focus", () => {
      activeProjectWindow?.webContents.send("window-state-change", "active");
    });

    activeProjectWindow.loadFile(
      require.resolve(`@triplex/editor/loading.html`)
    );

    try {
      const result = await ensureDepsInstall(
        cwd,
        welcomeWindow || activeProjectWindow,
        abortContoller.signal
      );

      if (result === false) {
        // Install was aborted, return.
        return;
      }
    } catch (error_) {
      const error = error_ as Error;
      const { response } = await dialog.showMessageBox({
        buttons: ["OK", "Learn more"],
        cancelId: -1,
        defaultId: 0,
        detail: error.message,
        message: "Could not install project dependencies",
        type: "error",
      });

      if (response === 1) {
        shell.openExternal(
          "https://triplex.dev/docs/supporting/installing-dependencies"
        );
      }

      return;
    }

    if (welcomeWindow) {
      welcomeWindow.close();
      welcomeWindow = undefined;
    }

    if (HEADLESS_RUN) {
      // Do nothing!
    } else {
      activeProjectWindow.show();
    }

    connectMenuToRenderer(activeProjectWindow);
    applyWindowIpcHandlers(activeProjectWindow);

    log.info("forking");

    try {
      const p = await fork(join(__dirname, "./project.ts"), { cwd });

      activeProjectWindow.webContents.ipc.handle("get-triplex-env", () => ({
        ...p.data,
      }));

      cleanup = () => {
        p.kill();
      };

      const searchParams = `?path=${p.data?.path}&exportName=${p.data?.exportName}`;

      log.info("starting editor");

      await (process.env.TRIPLEX_ENV === "development"
        ? activeProjectWindow.loadURL(
            `http://localhost:${EDITOR_DEV_PORT}${searchParams}`
          )
        : activeProjectWindow.loadFile(
            require.resolve(`@triplex/editor/dist/index.html`),
            {
              search: searchParams,
            }
          ));
    } catch {
      await (process.env.TRIPLEX_ENV === "development"
        ? activeProjectWindow.loadURL(
            `http://localhost:${EDITOR_DEV_PORT}/fallback-error.html`
          )
        : activeProjectWindow.loadFile(
            require.resolve(`@triplex/editor/dist/fallback-error.html`)
          ));
    }
  }

  async function openProjectDialog(
    message?: string
  ): Promise<string | undefined> {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      message,
      properties: ["openDirectory"],
      title: "Open Project",
    });

    const path = filePaths.at(0);

    if (canceled || !path) {
      return undefined;
    } else {
      const foundFolder = await findTriplexFolder(path);
      if (foundFolder) {
        return foundFolder;
      }

      const result = await dialog.showMessageBox({
        buttons: ["Create a project...", "Open another project...", "Cancel"],
        detail: "Want to create a project instead?",
        message: "Project could not be found",
        type: "warning",
      });

      switch (result.response) {
        case 0: {
          if (welcomeWindow) {
            createTriplexProject(welcomeWindow);
          }

          return undefined;
        }

        case 1: {
          return openProjectDialog();
        }

        default:
          return;
      }
    }
  }

  async function createTriplexProject(browserWindow: BrowserWindow) {
    const filename = await showCreateDialog();
    if (filename) {
      try {
        const result = await createProject(browserWindow, filename);
        if (result === false) {
          return;
        }
      } catch (error_) {
        const error = error_ as Error;
        const { response } = await dialog.showMessageBox({
          buttons: ["OK", "Learn more"],
          cancelId: -1,
          defaultId: 0,
          detail:
            "There was an error during project creation, please check your package manager. \n\n" +
            error.message,
          message: "Project partially created",
          type: "error",
        });

        if (response === 1) {
          shell.openExternal(
            "https://triplex.dev/docs/supporting/installing-dependencies"
          );
        }

        return;
      }

      await onOpenProject(filename);
    }
  }

  function applyGlobalIpcHandlers() {
    ipcMain.on("open-link", (_, url: string) => {
      shell.openExternal(url);
    });

    ipcMain.on(
      "open-editor",
      async (_, path: string, opts?: { column: number; line: number }) => {
        launchEditor(opts ? `${path}:${opts.line}:${opts.column}` : path);
      }
    );

    ipcMain.on("send-command", async (_, id: string) => {
      switch (id) {
        case "view-logs":
          shell.openPath(getLogPath());
          break;

        case "close-project":
          onCloseProject();
          break;

        case "show-devtools":
          activeProjectWindow?.webContents.openDevTools();
          break;

        case "open-project": {
          const projectDir = await openProjectDialog();
          if (projectDir) {
            await onOpenProject(projectDir);
          }
          break;
        }

        case "create-project": {
          if (welcomeWindow) {
            await createTriplexProject(welcomeWindow);
          }
          break;
        }

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

  if (process.env.FORCE_EDITOR_TEST_FIXTURE) {
    // Immediately open the test fixture project
    await onOpenProject(
      join(process.cwd(), "..", "..", "examples", "test-fixture")
    );
  } else {
    welcomeWindow = await openWelcomeScreen();
  }

  applyGlobalIpcHandlers();

  onMenuItemPress((menuItemId) => {
    if (activeProjectWindow) {
      // Send the event to the current active window.
      activeProjectWindow.webContents.send("menu-item-press", menuItemId);
    }
  });
}

app.on("ready", () => {
  if (process.env.TRIPLEX_ENV !== "development") {
    autoUpdater.checkForUpdatesAndNotify();
  }

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
