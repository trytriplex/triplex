/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readdir } from "node:fs/promises";
import { join, resolve } from "upath";

export async function findParentFile(
  dirpath: string,
  filename: string,
): Promise<string> {
  const next = resolve(dirpath, "..");

  if (dirpath === next) {
    // We've traversed all the way up the folder path and found nothing.
    // Bail out!
    throw new Error(`invariant: ${filename} could not be found`);
  }

  const dir = await readdir(dirpath);
  if (dir.includes(filename)) {
    return join(dirpath, filename);
  }

  return findParentFile(next, filename);
}
