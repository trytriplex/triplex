/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { type TriplexResolvedMeta } from "@triplex/bridge/client";
import { type Object3D } from "three";
import { getTriplexMeta, resolveElementMeta } from "../../util/meta";

export interface ResolvedObject3D {
  meta: TriplexResolvedMeta;
  object: Object3D;
  space: "local" | "world";
}

export const findTransformedSceneObject = (
  sceneObject: Object3D,
  filter: { transform: "none" | "translate" | "scale" | "rotate" },
): Object3D => {
  const transform =
    filter.transform === "none" ? "translate" : filter.transform;
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
    if (!foundExactSceneObject && meta[transform]) {
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

export const findObject3D = (
  scene: Object3D,
  filter: { column: number; line: number; path: string },
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
    transform: "none" | "translate" | "scale" | "rotate";
  },
): ResolvedObject3D | null => {
  const target = findObject3D(scene, filter);

  if (target) {
    const meta = resolveElementMeta(target, filter);

    if (meta) {
      const sceneObject = /^[a-z]/.test(meta.name)
        ? target
        : findTransformedSceneObject(target, filter);

      return {
        meta,
        object: sceneObject,
        space: "local",
      };
    }
  }

  return null;
};
