/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
