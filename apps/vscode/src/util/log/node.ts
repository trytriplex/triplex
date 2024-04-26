/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function logger(scope: string) {
  return (...msg: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`${scope}: `, ...msg);
  };
}
