/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

/**
 * Converts an object to JSON while ensuring undefined values are preserved.
 */
export function stringifyJSON(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v
  );
}
