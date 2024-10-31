/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function logger(scope: string) {
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
