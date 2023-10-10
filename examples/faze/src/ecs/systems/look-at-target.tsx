/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Vector3 } from "three";
import { copy, equal2 } from "../../math/vectors";
import { world } from "../store";

const V1 = new Vector3();

export function useLookAtTarget() {
  const { entities } = useEntities(world.with("target", "sceneObject"));

  useFrame(() => {
    for (let i = 0; i < entities.length; i++) {
      const { sceneObject, target } = entities[i];

      const targetv = copy(V1, target);
      targetv.y = sceneObject.current.position.y;

      if (equal2(targetv, sceneObject.current.position)) {
        continue;
      }

      sceneObject.current.lookAt(targetv);
    }
  });
}
