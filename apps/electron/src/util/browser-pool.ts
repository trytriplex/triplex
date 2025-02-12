/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { BrowserWindow } from "electron";
import { defer } from "./promise";

export function createWindowBrowserPool(
  options?: Electron.BrowserWindowConstructorOptions,
  maxBrowserCount = 5,
) {
  const browserWindows: BrowserWindow[] = [];
  const waiting: (() => void)[] = [];

  return async function getBrowserWindow(): Promise<BrowserWindow> {
    if (browserWindows.length === maxBrowserCount) {
      const deferred = defer();
      waiting.push(deferred.resolve);
      await deferred.promise;
      return getBrowserWindow();
    }

    const browser = new BrowserWindow(options);

    browserWindows.push(browser);

    browser.on("closed", () => {
      browserWindows.splice(browserWindows.indexOf(browser), 1);
      waiting.forEach((cb) => cb());
      waiting.length = 0;
    });

    return browser;
  };
}
