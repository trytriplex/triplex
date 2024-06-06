/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type RendererElementProps,
  type TriplexMeta,
  type TriplexResolvedMeta,
} from "@triplex/bridge/client";
import { Box3, Sphere, type Object3D } from "three";

export type EditorNodeData = RendererElementProps["__meta"] & {
  parentPath: string;
  // Unaltered props currently set on the component.
  props: Record<string, unknown>;
  sceneObject: Object3D;
  space: "local" | "world";
};

export const findTransformedSceneObject = (
  sceneObject: Object3D,
  filter: { transform: "translate" | "scale" | "rotate" }
): Object3D => {
  let foundExactSceneObject: Object3D | undefined = undefined;
  let foundTranslatedSceneObject: Object3D | undefined;

  sceneObject.traverse((child: Object3D) => {
    const meta = getTriplexMeta(child);
    if (!meta) {
      return;
    }

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // This data is set by the @triplex/client babel plugin.
    if (!foundExactSceneObject && meta[filter.transform]) {
      foundExactSceneObject = child;
    }

    // As a backup we mark a the first found translated scene object if present.
    // We use this if scale and rotate are not found when traversing children.
    // This means the transform gizmo stays on the scene object instead of moving to [0,0,0].
    if (!foundTranslatedSceneObject && meta.translate) {
      foundTranslatedSceneObject = child;
    }
  });

  return foundExactSceneObject || foundTranslatedSceneObject || sceneObject;
};

export function hasTriplexMeta(
  obj: Object3D
): obj is Object3D & { __triplex: TriplexMeta & { __r3f: unknown } } {
  if ("__triplex" in obj) {
    return true;
  }

  return false;
}

export function getTriplexMeta(obj: Object3D | null): TriplexMeta | undefined {
  if (obj && hasTriplexMeta(obj)) {
    const { __r3f: _, ...meta } = obj.__triplex;
    return meta;
  }

  return undefined;
}

export function isActiveElement(
  node: { column: number; line: number; path: string },
  filter: {
    elements: { column: number; line: number }[];
    path: string;
  }
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

export function resolveObject3DMeta(
  obj: Object3D,
  filter:
    | {
        elements: { column: number; line: number }[];
        path: string;
      }
    | { column: number; line: number; path: string }
): TriplexResolvedMeta | null {
  let parentObject: Object3D | null = obj;

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

    parentObject = parentObject.parent;
  }

  return null;
}

export const findObject3D = (
  scene: Object3D,
  filter: { column: number; line: number; path: string }
): Object3D | null => {
  let foundSceneObject: Object3D | null = null;

  scene.traverse((obj) => {
    const meta = getTriplexMeta(obj);
    if (!meta || foundSceneObject) {
      return;
    }

    if (
      meta.path === filter.path &&
      meta.column === filter.column &&
      meta.line === filter.line
    ) {
      // We found a direct match for a host element — resolve it and return!
      foundSceneObject = obj;
    }

    for (const parent of meta.parents) {
      // Check the parents in the meta to see if they are a match and if so resolve the object.
      if (
        parent.path === filter.path &&
        parent.column === filter.column &&
        parent.line === filter.line
      ) {
        foundSceneObject = obj;
      }
    }
  });

  return foundSceneObject;
};

export const resolveObject3D = (
  scene: Object3D,
  filter: {
    column: number;
    line: number;
    path: string;
    transform: "translate" | "scale" | "rotate";
  }
): EditorNodeData | null => {
  const target = findObject3D(scene, filter);

  if (target) {
    const meta = resolveObject3DMeta(target, filter);

    if (meta) {
      const sceneObject = /^[a-z]/.test(meta.name)
        ? target
        : findTransformedSceneObject(target, filter);

      return {
        ...meta,
        parentPath: filter.path,
        sceneObject,
        space: "local",
      };
    }
  }

  return null;
};

/**
 * Builds a sphere of the current scene excluding very large objects like
 * TransformControls.
 */
export function buildSceneSphere(scene: Object3D) {
  let sceneBox = new Box3();

  scene.children.forEach((child) => {
    const localBox = new Box3().setFromObject(child);
    const length = localBox.max.lengthSq();

    if (length === Number.POSITIVE_INFINITY || length > 1_000_000) {
      return;
    }

    sceneBox = sceneBox.union(localBox);
  });

  return sceneBox.getBoundingSphere(new Sphere());
}
