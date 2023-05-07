import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { reset } from "../../math/vectors";
import { world } from "../store";

export function useRest() {
  const { entities } = useEntities(world.with("rest", "velocity"));

  useFrame((_, delta) => {
    for (const entity of entities) {
      entity.rest -= delta;

      if (entity.rest <= 0) {
        world.removeComponent(entity, "rest");
      } else {
        reset(entity.velocity);
      }
    }
  });
}
