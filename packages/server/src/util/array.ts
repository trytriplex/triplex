/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function unique<TValue>(v: TValue, i: number, a: TValue[]) {
  return a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i;
}
