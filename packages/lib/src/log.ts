/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export function createForkLogger(scope: string) {
  return {
    debug: (...msg: string[]) => {
      process.send?.({
        log: {
          message: msg,
          scope,
          type: "debug",
        },
      });
    },
    error: (...msg: string[]) => {
      process.send?.({
        log: {
          message: msg,
          scope,
          type: "error",
        },
      });
    },
    info: (...msg: string[]) => {
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
