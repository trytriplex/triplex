/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import anymatch from "anymatch";

export function fromCwd(path: string): string {
  return join(process.cwd(), path);
}

export function matchFile(file: string, fileGlobs: string[]): boolean {
  const normalizedFiles = fileGlobs.map((file) => file);

  for (let i = 0; i < normalizedFiles.length; i++) {
    const glob = normalizedFiles[i];
    const match = anymatch(glob);

    if (match(file)) {
      return true;
    }
  }

  return false;
}
