/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function unique<TValue>(v: TValue, i: number, a: TValue[]) {
  return a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i;
}
