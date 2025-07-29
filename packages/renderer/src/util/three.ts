/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import type CameraControls from "camera-controls";
import { Box3, Sphere, Spherical, Vector3, type Object3D } from "three";
import { type ResolvedObject3D } from "../features/selection-three-fiber/resolver";
import { editorLayer } from "./layers";

export function buildSceneSphere(objects: Object3D[]) {
  const tempBox = new Box3();
  const sceneBox = new Box3();

  objects.forEach((child) => {
    if (child.layers.test(editorLayer) || child.type.includes("Helper")) {
      // Skip over anything that is in the editor layer or a helper.
      return;
    }

    tempBox.setFromObject(child);

    if (tempBox.max.lengthSq() > 1000) {
      // Skip over anything that is too large.
      return;
    }

    sceneBox.union(tempBox);
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
  const props = { ...selected.meta.props.current };

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

export function strip(num: number): number {
  return +Number.parseFloat(Number(num).toPrecision(15));
}

export function fitCameraToObjects(
  objects: Object3D[],
  controls: CameraControls,
  vector = new Vector3(0, 0, 1),
  tween = false,
) {
  const sphere = buildSceneSphere(objects);
  if (
    sphere.isEmpty() ||
    /**
     * There are edge cases where a scene can return NaN for its radius. One
     * example is the uikit example in test-fixtures doing this on initial load.
     * To prevent the camera from getting into invalid states we check this and
     * abort early.
     */
    Number.isNaN(sphere.radius)
  ) {
    return;
  }

  const point = new Spherical().setFromVector3(vector);

  controls.rotateTo(point.theta, point.phi, tween);
  controls.fitToSphere(sphere, tween);
}
