/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

/** Parses JSON while handling preserved undefined values. */
export function parseJSON(value: string) {
  return JSON.parse(value, (_k, v) => (v === "__UNDEFINED__" ? undefined : v));
}
