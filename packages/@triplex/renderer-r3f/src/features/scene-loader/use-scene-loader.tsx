/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Modules } from "@triplex/bridge/client";
import { Fragment } from "react";
import { suspend } from "suspend-react";
import { type Scene } from "./types";

export function useSceneLoader({
  exportName,
  modules,
  path,
}: {
  exportName: string;
  modules: Modules;
  path: string;
}): Scene | null {
  const relativePathToPickComponent = Object.keys(modules).find((filename) =>
    path ? path.endsWith(filename) : false,
  );

  if (!relativePathToPickComponent || !exportName) {
    return null;
  }

  const { component, meta } = suspend(async () => {
    const resolvedModule = await modules[relativePathToPickComponent]();
    const moduleExport = resolvedModule[exportName];
    const resolvedMeta = moduleExport.triplexMeta;

    return {
      component: moduleExport || Fragment,
      meta: resolvedMeta,
    };
  }, [exportName, modules, relativePathToPickComponent]);

  return {
    component,
    meta,
  };
}
