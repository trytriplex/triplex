/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import resolvePkgPath from "resolve-package-path";

export function checkMissingDependencies(
  modules: string[],
  cwd: string,
): string[] {
  const missing: string[] = [];

  for (const name of modules) {
    if (!resolvePkgPath(name, cwd)) {
      missing.push(name);
    }
  }

  return missing;
}
