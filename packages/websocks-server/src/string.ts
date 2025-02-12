/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
