/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
