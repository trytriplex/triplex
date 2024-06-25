/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { world } from "../store";

export function useBillboard() {
  const { entities } = useEntities(world.with("billboard", "sceneObject"));
  const { entities: cameras } = useEntities(
    world.with("camera", "sceneObject"),
  );

  const camera = cameras[0];

  useFrame(() => {
    for (const { sceneObject } of entities) {
      sceneObject.current.quaternion.copy(
        camera.sceneObject.current.quaternion,
      );
    }
  });
}
