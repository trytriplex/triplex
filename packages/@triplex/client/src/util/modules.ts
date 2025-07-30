/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import resolvePackagePath from "resolve-package-path";
import { type InitializationConfig } from "../types";

export const optionalDeps = [
  { name: "@react-three/fiber" },
  {
    name: "@react-three/xr",
    /**
     * TODO: If a package has their own dependency on XR and doesn't have it
     * installed at the top level then we need to make sure we don't stub it out
     * breaking their experience.
     *
     * Right now we're hardcoding it to a specific package. Instead we should
     * just check if a package has it as a dependency?
     */
    skipIf: "@react-three/viverse",
  },
  { name: "three" },
];

export function depsToSkipOptimizing(opts: InitializationConfig): string[] {
  const missingDeps = optionalDeps.filter((dep) => {
    if (dep.skipIf) {
      const skipPath = resolvePackagePath(dep.skipIf, opts.config.cwd);
      if (skipPath) {
        return false; // Skip this dependency if the skip condition is met
      }
    }

    const depPath = resolvePackagePath(dep.name, opts.config.cwd);
    return !depPath;
  });

  return missingDeps.map((dep) => dep.name);
}

export function createStubModuleTester(opts: InitializationConfig) {
  const missingDeps = depsToSkipOptimizing(opts);

  return function shouldStubModule(id: string): boolean {
    return missingDeps.includes(id);
  };
}
