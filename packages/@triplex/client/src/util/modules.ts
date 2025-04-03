/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import resolvePackagePath from "resolve-package-path";
import { type InitializationConfig } from "../types";

export const optionalDeps = ["@react-three/fiber", "@react-three/xr", "three"];

export function depsToSkipOptimizing(opts: InitializationConfig) {
  const missingDeps = optionalDeps.filter((dep) => {
    const depPath = resolvePackagePath(dep, opts.config.cwd);
    return !depPath;
  });

  return missingDeps;
}

export function createStubModuleTester(opts: InitializationConfig) {
  const missingDeps = depsToSkipOptimizing(opts);

  return function shouldStubModule(id: string): boolean {
    return missingDeps.includes(id);
  };
}
