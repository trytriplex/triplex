/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import log from "electron-log";

log.initialize({ preload: true, spyRendererConsole: true });
Object.assign(console, log.functions);

export const getLogPath = (): string => {
  return log.transports.file.getFile().path;
};

export function logger(scope: string) {
  return log.scope(scope);
}
