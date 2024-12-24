/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type TriplexMeta,
  type TriplexResolvedMeta,
} from "@triplex/bridge/client";
import { type Object3D } from "three";

export function hasTriplexMeta(obj: Node | Object3D): obj is (
  | Node
  | Object3D
) & {
  __triplex: TriplexMeta & { __r3f: unknown };
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

export function isActiveElement(
  node: { column: number; line: number; path: string },
  filter: {
    elements: { column: number; line: number }[];
    path: string;
  },
): boolean {
  if (filter.path === node.path) {
    for (const element of filter.elements) {
      if (node.line === element.line && node.column === element.column) {
        return true;
      }
    }
  }

  return false;
}

export function resolveElementMeta(
  obj: Node | Object3D | undefined,
  filter:
    | {
        elements: { column: number; line: number }[];
        path: string;
      }
    | { column: number; line: number; path: string },
): TriplexResolvedMeta | null {
  let parentObject: Node | Object3D | null = obj ?? null;

  while (parentObject) {
    const meta = getTriplexMeta(parentObject);
    if (meta) {
      // Iterate through parents to find the first component that matches the path.
      for (const parent of meta.parents) {
        const filterMatches =
          "column" in filter
            ? filter.column === parent.column &&
              filter.line === parent.line &&
              parent.path === filter.path
            : isActiveElement(parent, filter);

        if (filterMatches) {
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
