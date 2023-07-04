/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Intersection, Object3D, Raycaster, Vector3 } from "three";
import { add, copy, isEmpty2, reset2, sub2 } from "../../math/vectors";
import { noop } from "../../utils/functions";
import { TERRAIN } from "../../utils/layers";
import { world } from "../store";

const V1 = new Vector3();
const DOWN = new Vector3(0, -1, 0);
const raycaster = new Raycaster();
const intersects: Intersection<Object3D>[] = [];

export function useRigidBody() {
  const { entities } = useEntities(
    world.with("velocity", "rigidBody", "box", "sceneObject")
  );

  useFrame((state, delta) => {
    for (const entity of entities) {
      const {
        box,
        onWorldEvent = noop,
        npc,
        focused,
        sceneObject,
        velocity,
      } = entity;

      if (npc && focused) {
        // Stop npcs moving when players are interacting with them.
        entity.gravityAcceleration = 0;
        continue;
      }

      // Multiply the velocity vector by delta for frame rate independent movement
      const displacement = copy(V1, velocity).multiplyScalar(delta);

      // Commit the XYZ movement
      add(sceneObject.current.position, displacement);

      // Check if the movement caused this entity to intersect with any other entity
      const intersectingBox = box.intersecting();
      if (intersectingBox) {
        // Revert the XZ movement before intersecting
        sub2(sceneObject.current.position, displacement);

        if (entity.state !== "idle") {
          // Force the entity to stop moving.
          // TODO: Some form of collision resolution instead of immediately stopping.
          entity.state = "idle";
          onWorldEvent("move-stop");
        }

        reset2(velocity);
      }

      if (!isEmpty2(velocity) && entity.state !== "moving") {
        // First tick that we've started moving - notify wold events!
        onWorldEvent("move-start");
        entity.state = "moving";
      }

      const height = box.box.getSize(V1).y;
      const origin = box.box.getCenter(V1);

      intersects.length = 0;
      raycaster.layers.set(TERRAIN);
      raycaster.set(origin, DOWN);
      raycaster.intersectObjects(state.scene.children, true, intersects);

      if (intersects.length) {
        for (let i = 0; i < intersects.length; i++) {
          const intersect = intersects[i];
          // We update distance to be from the base of the entity so we know
          // when we are "clipping" through the ground and can reconcile it.
          const distanceFromEntityBase = intersect.distance - height / 2;
          if (distanceFromEntityBase < 0) {
            // We are clipping through the ground! Let's lift the entity back up.
            sceneObject.current.position.y -= distanceFromEntityBase;

            if (entity.gravityAcceleration !== undefined) {
              entity.gravityAcceleration = 0;
            }
          }

          // We're only interested in the first mesh - let's go to the next entity.
          break;
        }
      }

      // Update the bounding box position so it's in the latest position.
      box.update();
    }
  });
}
