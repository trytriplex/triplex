/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import resolvePkgPath from "resolve-package-path";

export function checkMissingDependencies(
  modules: string[],
  cwd: string,
): string[] {
  if (process.env.NODE_ENV !== "production" && cwd.includes("missing-deps")) {
    // THIS IS FOR TESTING ONLY AND SHOULD NOT APPEAR IN PRODUCTION BUILDS!
    return ["@react-three/fiber", "three", "react-dom", "react"];
  }

  const missing: string[] = [];

  for (const name of modules) {
    if (!resolvePkgPath(name, cwd)) {
      missing.push(name);
    }
  }

  return missing;
}
