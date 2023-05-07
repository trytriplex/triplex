import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { hasValues2 } from "../../math/vectors";
import { world } from "../store";

export function useDeactivateItem() {
  const { entities: items } = useEntities(world.with("item", "focused"));
  const { entities: players } = useEntities(
    world.with("player", "focused", "velocity")
  );
  const { entities: npcs } = useEntities(world.with("npc", "focused"));

  useFrame(() => {
    for (const item of items) {
      const player = players.at(-1);

      if ((player && hasValues2(player.velocity)) || npcs.length) {
        world.remove(item);
      }
    }
  });
}
