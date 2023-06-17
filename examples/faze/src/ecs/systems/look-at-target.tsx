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
      const { target, sceneObject } = entities[i];

      const targetv = copy(V1, target);
      targetv.y = sceneObject.current.position.y;

      if (equal2(targetv, sceneObject.current.position)) {
        continue;
      }

      sceneObject.current.lookAt(targetv);
    }
  });
}
