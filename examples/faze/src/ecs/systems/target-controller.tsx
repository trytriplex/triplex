/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Vector3 } from "three";
import { copy, distanceToSquared, equal, reset, sub } from "../../math/vectors";
import { noop } from "../../utils/functions";
import { world } from "../store";

const V1 = new Vector3();

export function useTargetController() {
  const { entities } = useEntities(
    world.with("target", "velocity", "sceneObject")
  );

  useFrame((_, delta) => {
    for (let i = 0; i < entities.length; i++) {
      const {
        onWorldEvent = noop,
        sceneObject,
        speed,
        target,
        velocity,
      } = entities[i];

      if (equal(sceneObject.current.position, target)) {
        continue;
      }

      if (entities[i].rigidBody) {
        // We set the target Y axis for rigid bodies as they can't move along the Y axis.
        // This ends up making the Y axis irrelevant for rigid bodies but still allows kinematic
        // bodies to move along the Y axis.
        target.y = sceneObject.current.position.y;
      }

      if (
        Math.abs(distanceToSquared(sceneObject.current.position, target)) <=
        delta
      ) {
        // We'll reach the target in the next frame, we're done!
        if (entities[i].state !== "idle") {
          entities[i].state = "idle";

          onWorldEvent("move-stop");
          onWorldEvent("target-reached");

          copy(target, sceneObject.current.position);
          reset(velocity);
        }

        continue;
      }

      const nextVelocityVector = sub(
        copy(V1, target),
        sceneObject.current.position
      )
        .normalize()
        .multiplyScalar(speed || 1);

      copy(velocity, nextVelocityVector);
    }
  });
}
