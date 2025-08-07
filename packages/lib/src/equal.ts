/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function equal(
  obj1: unknown[] | undefined,
  obj2: unknown[] | undefined,
): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
    return false;
  }

  if (obj1.length !== obj2.length) {
    return false;
  }

  for (let i = 0; i < obj1.length; i++) {
    if (obj1[i] !== obj2[i]) {
      return false;
    }
  }

  return true;
}
