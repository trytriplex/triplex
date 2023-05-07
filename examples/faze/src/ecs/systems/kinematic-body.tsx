import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { Vector3 } from "three";
import { add, copy, isEmpty } from "../../math/vectors";
import { noop } from "../../utils/functions";
import { world } from "../store";

const V1 = new Vector3();

export function useKinematicBody() {
  const { entities } = useEntities(
    world.with("velocity", "kinematicBody", "sceneObject")
  );

  useFrame((_, delta) => {
    for (let i = 0; i < entities.length; i++) {
      const { onWorldEvent = noop, sceneObject, velocity } = entities[i];

      if (isEmpty(velocity)) {
        // Nothing to do! Move onto the next entity.
        continue;
      }

      // Multiply the velocity vector by delta for frame rate independent movement
      const displacement = copy(V1, velocity).multiplyScalar(delta);

      // Commit the movement
      add(sceneObject.position, displacement);

      if (entities[i].state !== "moving") {
        // First tick that we've started moving - notify wold events!
        onWorldEvent("move-start");
        entities[i].state = "moving";
      }
    }
  });
}
