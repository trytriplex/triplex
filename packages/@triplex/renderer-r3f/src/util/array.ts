/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function flatten<TItem extends { children: TItem[] }>(
  arr: TItem[]
): TItem[] {
  const result: TItem[] = [];

  for (const elem of arr) {
    const children = flatten(elem.children);

    for (const child of children) {
      result.push(child);
    }

    result.push(elem);
  }

  return result;
}
