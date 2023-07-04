/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
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
