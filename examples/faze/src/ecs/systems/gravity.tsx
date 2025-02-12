/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Vector3 } from "three";
import { copy, copy2 } from "../../math/vectors";
import { world } from "../store";

const V1 = new Vector3();
const gravityConstant = -9.8;
const accelerationFactor = 5;

export function useGravity() {
  const { entities } = useEntities(world.with("rigidBody", "velocity"));

  useFrame((_, delta) => {
    for (const entity of entities) {
      if (entity.gravityAcceleration === undefined) {
        world.addComponent(entity, "gravityAcceleration", 0);
      }

      // We want to replace the y velocity with gravity but before we do we
      // need to reset it so the vector speed is balanced against the XZ axis.
      // If we didn't do this the vector speed would be balanced against XYZ axis
      // and to a player appear slower than it should be if Y was defined.
      const nextVelocity = copy2(V1, entity.velocity);
      nextVelocity.y = 0;
      nextVelocity.normalize().multiplyScalar(entity.speed || 1);

      // Apply gravity!
      entity.gravityAcceleration! += delta;
      nextVelocity.y =
        gravityConstant * entity.gravityAcceleration! * accelerationFactor;

      copy(entity.velocity, nextVelocity);
    }
  });
}
