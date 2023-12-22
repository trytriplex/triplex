/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { app } from "electron";
import { dirname, join } from "upath";
import { createWindowBrowserPool } from "./browser-pool";

const appDataDir = app.getPath("userData");

const getWindowBrowser = createWindowBrowserPool({
  height: 200,
  show: false,
  titleBarStyle: "hidden",
  width: 200,
});

function buildPath({ exportName, path }: { exportName: string; path: string }) {
  const filepathHash = createHash("md5").update(path).digest("hex").slice(0, 7);
  const thumbnailPath = join(
    appDataDir,
    "tmp",
    "thumbnails",
    `${filepathHash}-${exportName}.png`
  );

  return thumbnailPath;
}

/**
 * @precondition The client server must have been started.
 *
 * Screenshots a component and returns its position on the filesystem.
 */
export async function screenshotComponent({
  exportName,
  path,
  port,
}: {
  exportName: string;
  path: string;
  port: number;
}) {
  const thumbnailPath = buildPath({ exportName, path });

  if (existsSync(thumbnailPath)) {
    return thumbnailPath;
  }

  const thumbnailWindow = await getWindowBrowser();

  thumbnailWindow.loadURL(
    `http://localhost:${port}/__thumbnail?path=${encodeURIComponent(
      path
    )}&exportName=${exportName}`
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => reject("timeout"), 2000);

    thumbnailWindow.webContents.on(
      "console-message",
      async (_, __, message) => {
        if (message === "screenshot!") {
          const res = await thumbnailWindow.webContents.capturePage(undefined, {
            stayHidden: true,
          });

          thumbnailWindow.close();

          await mkdir(dirname(thumbnailPath), { recursive: true });
          await writeFile(thumbnailPath, res.toPNG());

          resolve(thumbnailPath);
        }
      }
    );
  });
}

export function invalidateScreenshot(opts: {
  exportName: string;
  path: string;
}) {
  const thumbnailPath = buildPath(opts);
  rm(thumbnailPath, { force: true });
}
