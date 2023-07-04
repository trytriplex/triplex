/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { hasValues2 } from "../../math/vectors";
import { world } from "../store";

export function useDeactivateNpcs() {
  const { entities: players } = useEntities(
    world.with("player", "focused", "velocity")
  );
  const { entities: npcs } = useEntities(world.with("npc", "focused"));

  useFrame(() => {
    for (const npc of npcs) {
      const player = players.at(-1);

      if (player && hasValues2(player.velocity)) {
        world.removeComponent(npc, "focused");
      }
    }
  });
}
