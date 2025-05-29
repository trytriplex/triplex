/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable no-console */

export function createForkLogger(scope: string) {
  return {
    debug: (...msg: string[]) => {
      console.debug(`[${scope}]`, ...msg);
      process.send?.({
        log: {
          message: msg,
          scope,
          type: "debug",
        },
      });
    },
    error: (...msg: string[]) => {
      console.error(`[${scope}]`, ...msg);
      process.send?.({
        log: {
          message: msg,
          scope,
          type: "error",
        },
      });
    },
    info: (...msg: string[]) => {
      console.info(`[${scope}]`, ...msg);
      process.send?.({
        log: {
          message: msg,
          scope,
          type: "info",
        },
      });
    },
  };
}
