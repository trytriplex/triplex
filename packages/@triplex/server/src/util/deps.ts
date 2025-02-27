/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import resolvePkgPath from "resolve-package-path";

const coreReactModules = ["@types/react", "react", "react-dom"];

const optionalThreeFiberModules = [
  "@react-three/fiber",
  "@types/three",
  "three",
];

export function checkMissingDependencies(cwd: string): string[] {
  const missingCore: string[] = [];
  const missingOptional: string[] = [];

  for (const name of coreReactModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingCore.push(name);
    }
  }

  for (const name of optionalThreeFiberModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingOptional.push(name);
    }
  }

  if (missingOptional.length === optionalThreeFiberModules.length) {
    // All optional dependencies are missing so we ignore them and continue on.
    return missingCore.sort();
  } else {
    return missingCore.concat(missingOptional).sort();
  }
}
