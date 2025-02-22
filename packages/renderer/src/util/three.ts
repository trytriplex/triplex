/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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

    if (
      child.name === "forced_visible" ||
      length === Number.POSITIVE_INFINITY ||
      length > 1_000_000
    ) {
      return;
    }

    sceneBox = sceneBox.union(localBox);
  });

  return sceneBox.getBoundingSphere(new Sphere());
}

export function isObjectVisible(obj: Object3D): boolean {
  const isInteractionPanel = "isInteractionPanel" in obj;

  if (isInteractionPanel || obj.name === "forced_visible") {
    return true;
  }

  if (!obj.visible) {
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
