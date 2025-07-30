/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type TriplexMeta } from "@triplex/bridge/client";
import { type Object3D } from "three";

export function hasTriplexMeta(obj: Node | Object3D): obj is (
  | Node
  | Object3D
) & {
  __triplex: TriplexMeta;
} {
  if ("__triplex" in obj) {
    return true;
  }

  return false;
}

export function getTriplexMeta(
  obj: Node | Object3D | null | undefined,
): TriplexMeta | undefined {
  if (obj && hasTriplexMeta(obj)) {
    return obj.__triplex;
  }

  return undefined;
}

export function resolveElementMeta(
  obj: Node | Object3D | undefined,
  filter:
    | {
        exportName: string;
        path: string;
      }
    | { column: number; line: number; path: string },
): TriplexMeta | null {
  const objMeta = getTriplexMeta(obj);

  if (!obj) {
    return null;
  }

  if (objMeta) {
    const doesObjMatchFilter =
      "column" in filter
        ? filter.column === objMeta.column &&
          filter.line === objMeta.line &&
          objMeta.path === filter.path
        : filter.exportName === objMeta.exportName &&
          objMeta.path === filter.path;

    if (doesObjMatchFilter) {
      // We short circuit and immediately return the objects meta if it matches the filter.
      return objMeta;
    }
  }

  let parentObject: Node | Object3D | null = obj;

  while (parentObject) {
    const meta = getTriplexMeta(parentObject);
    if (meta) {
      // Iterate through parents to find the first component that matches the path.
      for (const parent of meta.parents) {
        const doesParentMatchFilter =
          "column" in filter
            ? filter.column === parent.column &&
              filter.line === parent.line &&
              parent.path === filter.path
            : filter.exportName === parent.exportName &&
              filter.path === parent.path;

        if (doesParentMatchFilter) {
          return parent;
        }
      }

      if (meta.column >= 0 && meta.line >= 0) {
        // No parents match.
        return meta;
      }
    }

    parentObject =
      "parentElement" in parentObject
        ? parentObject.parentElement
        : parentObject.parent;
  }

  return null;
}
