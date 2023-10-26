/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "node:path";
import anymatch from "anymatch";

export function fromCwd(path: string): string {
  return join(process.cwd(), path);
}

export function matchFile(file: string, fileGlobs: string[]): boolean {
  const normalizedFiles = fileGlobs.map((file) => file.replaceAll("\\", "/"));

  for (let i = 0; i < normalizedFiles.length; i++) {
    const glob = normalizedFiles[i];
    const match = anymatch(glob);

    if (match(file)) {
      return true;
    }
  }

  return false;
}
