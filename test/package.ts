/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdirSync } from "node:fs";
import { resolve } from "@triplex/lib/path";

function _resolveProjectCwd(
  startPath: string,
  __fallbackPkgJsonPath?: string,
): string | undefined {
  const next = resolve(startPath, "..");

  if (startPath === next) {
    // We've traversed all the way up the folder path and found nothing. Bail out!
    return __fallbackPkgJsonPath || undefined;
  }

  const dir = readdirSync(startPath);
  if (dir.includes("package.json") && !__fallbackPkgJsonPath) {
    // Keep track of the first found package.json just in case as a fallback cwd.
    return _resolveProjectCwd(next, startPath);
  }

  return _resolveProjectCwd(next, __fallbackPkgJsonPath);
}

export function findNearestPackageJSON(startPath: string): string | undefined {
  return _resolveProjectCwd(startPath);
}
