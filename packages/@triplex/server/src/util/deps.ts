/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import resolvePkgPath from "resolve-package-path";

const coreReactModules = ["@types/react", "react", "react-dom"];
const threeFiberModules = ["@react-three/fiber", "@types/three", "three"];
const optionalThreeFiberModules = ["@react-three/xr"];

export function checkMissingDependencies(cwd: string) {
  const missingCore: string[] = [];
  const missingThreeFiberDependencies: string[] = [];
  const missingOptionalThreeFiberDependencies: string[] = [];

  for (const name of coreReactModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingCore.push(name);
    }
  }

  for (const name of threeFiberModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingThreeFiberDependencies.push(name);
    }
  }

  for (const name of optionalThreeFiberModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingOptionalThreeFiberDependencies.push(name);
    }
  }

  if (missingThreeFiberDependencies.length === threeFiberModules.length) {
    // All optional dependencies are missing so we ignore them and continue on.
    return {
      category: "react",
      optional: [],
      required: missingCore.sort(),
    } as const;
  } else {
    return {
      category: "react-three-fiber",
      optional: missingOptionalThreeFiberDependencies,
      required: missingCore.concat(missingThreeFiberDependencies).sort(),
    } as const;
  }
}
