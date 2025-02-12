/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
