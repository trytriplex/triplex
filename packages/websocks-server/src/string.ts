/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

/** Converts an object to JSON while ensuring undefined values are preserved. */
export function stringifyJSON(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );
}

export function decodeParams(params?: Record<string, string> | null) {
  if (!params) {
    return {};
  }

  const newParams = { ...params };

  for (const key in newParams) {
    newParams[key] = decodeURIComponent(newParams[key]);
  }

  return newParams;
}
