/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

/** Parses JSON while handling preserved undefined values. */
export function parseJSON(value: string) {
  return JSON.parse(value, (_k, v) => (v === "__UNDEFINED__" ? undefined : v));
}
