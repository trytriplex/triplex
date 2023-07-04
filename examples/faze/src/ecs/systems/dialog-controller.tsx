/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Vector3 } from "three";
import { copy } from "../../math/vectors";
import { world } from "../store";

const V1 = new Vector3();

export function useDialogController() {
  const { entities } = useEntities(
    world.with("dialog", "sceneObject", "parent")
  );

  useFrame(() => {
    for (const { parent, sceneObject } of entities) {
      if (!parent.box || !parent.sceneObject || !parent.focused) {
        sceneObject.current.visible = false;
        continue;
      }

      const npcSize = parent.box.box.getSize(V1);

      copy(sceneObject.current.position, parent.sceneObject.current.position);

      sceneObject.current.position.y += npcSize.y * 1.6;
      sceneObject.current.visible = true;
    }
  });
}
