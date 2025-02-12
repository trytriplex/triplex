/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
