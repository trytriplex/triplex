/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { Box3, Sphere, Vector3, type Object3D } from "three";
import { type ResolvedObject3D } from "../features/selection-three-fiber/resolver";
import { editorLayer } from "./layers";

export function buildSceneSphere(scene: Object3D) {
  let sceneBox = new Box3();

  scene.children.forEach((child) => {
    if (child.layers.test(editorLayer)) {
      // Skip over anything that is in the editor layer.
      return;
    }

    const localBox = new Box3().setFromObject(child);
    const length = localBox.max.lengthSq();

    if (length === Number.POSITIVE_INFINITY || length > 1_000_000) {
      return;
    }

    sceneBox = sceneBox.union(localBox);
  });

  return sceneBox.getBoundingSphere(new Sphere());
}

export function isObjectVisible(obj: Object3D): boolean {
  const isMesh = "isMesh" in obj;
  const isInteractionPanel = "isInteractionPanel" in obj;

  if (isInteractionPanel || obj.name === "forced_visible") {
    return true;
  }

  if (!isMesh || !obj.visible) {
    return false;
  }

  // This mesh is visible however we need to check all parents just in case
  // one of them is invisible.
  let parentObject: Object3D | null = obj;

  while (parentObject) {
    if (!parentObject.visible) {
      return false;
    }

    parentObject = parentObject.parent;
  }

  return true;
}

export function encodeProps(selected: ResolvedObject3D) {
  const props = { ...selected.meta.props };

  for (const key in props) {
    const prop = props[key];
    if (prop && typeof prop === "object" && "$$typeof" in prop) {
      // We remove any jsx elements from props as they can't be serialized.
      delete props[key];
    }
  }

  if ("position" in props) {
    // If position exists we want to make sure we pass in the world position
    // So if any parent groups have their position set when we transition
    // It won't jump around unexpectedly.
    const worldPosition = selected.object
      .getWorldPosition(new Vector3())
      .toArray();

    return {
      ...props,
      position: worldPosition,
    };
  }

  return props;
}
