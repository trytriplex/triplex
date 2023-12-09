/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { JsxElementPositions } from "@triplex/server";
import { type Object3D } from "three";
import { type SceneObjectProps } from "../scene-object";

export type EditorNodeData = SceneObjectProps["__meta"] & {
  parentPath: string;
  // Unaltered props currently set on the component.
  props: Record<string, unknown>;
  sceneObject: Object3D;
  space: "local" | "world";
};

export const findTransformedSceneObject = (
  sceneObject: Object3D,
  transform: "translate" | "scale" | "rotate"
): Object3D => {
  let foundExactSceneObject: Object3D | undefined = undefined;
  let foundTranslatedSceneObject: Object3D | undefined;

  sceneObject.traverse((child: Object3D) => {
    const meta: SceneObjectProps["__meta"] | undefined =
      child.userData.triplexSceneMeta;

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // This data is set by the @triplex/client babel plugin.
    if (!foundExactSceneObject && meta && meta[transform]) {
      // The direct child will be the one we're interested in as it is a child
      // of the intermediately placed group in the SceneObject component.
      foundExactSceneObject = child.children[0];
    }

    // As a backup we mark a the first found translated scene object if present.
    // We use this if scale and rotate are not found when traversing children.
    // This means the transform gizmo stays on the scene object instead of moving to [0,0,0].
    if (!foundTranslatedSceneObject && meta && meta.translate) {
      // The direct child will be the one we're interested in as it is a child
      // of the intermediately placed group in the SceneObject component.
      foundTranslatedSceneObject = child.children[0];
    }
  });

  return foundExactSceneObject || foundTranslatedSceneObject || sceneObject;
};

export function isInScene(
  path: string,
  node: EditorNodeData,
  positions: JsxElementPositions[]
): boolean {
  if (path === node.path) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (node.line === position.line && node.column === position.column) {
        return true;
      }
    }
  }

  return false;
}

export const findEditorData = (
  path: string,
  object: Object3D,
  transform: "translate" | "scale" | "rotate",
  positions: JsxElementPositions[]
): EditorNodeData | null => {
  let parent: Object3D | null = object;
  let data: EditorNodeData | null = null;

  while (parent) {
    if (
      "triplexSceneMeta" in parent.userData &&
      !data &&
      isInScene(path, parent.userData.triplexSceneMeta, positions)
    ) {
      const isHostElement = !!/^[a-z]/.exec(
        parent.userData.triplexSceneMeta.name
      );

      // Keep traversing up the tree to find the top most wrapped scene object.
      data = {
        ...parent.userData.triplexSceneMeta,
        sceneObject: isHostElement
          ? parent.children[0]
          : findTransformedSceneObject(parent.children[0], transform),
        space: "world",
      } as EditorNodeData;
    }

    parent = parent.parent;

    if (
      data &&
      parent &&
      (parent.position.lengthSq() > 0 || parent.scale.lengthSq() > 0)
    ) {
      // There is a parent that has set position/scale so this must be local space.
      // This affects the resulting position calculated later on after a transform.
      data.space = "local";
    }
  }

  if (data) {
    return { ...data, parentPath: path };
  }

  return null;
};

export const findSceneObject = (
  scene: Object3D,
  pos: { column: number; line: number; path: string }
): Object3D | null => {
  let sceneObject: Object3D | null = null;

  scene.traverse((obj) => {
    if ("triplexSceneMeta" in obj.userData) {
      const node: EditorNodeData = obj.userData.triplexSceneMeta;

      if (
        node.path === pos.path &&
        node.column === pos.column &&
        node.line === pos.line &&
        obj.children[0]
      ) {
        sceneObject = obj.children[0];
      }
    }
  });

  return sceneObject;
};
