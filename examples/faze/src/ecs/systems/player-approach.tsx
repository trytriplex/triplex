/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { distanceToSquared } from "../../math/vectors";
import { noop } from "../../utils/functions";
import { world } from "../store";

export function usePlayerApproach() {
  const { entities } = useEntities(world.with("playerNear", "sceneObject"));
  const { entities: players } = useEntities(
    world.with("player", "sceneObject"),
  );

  useFrame(() => {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const {
        activateDistance = 30,
        onWorldEvent = noop,
        sceneObject,
      } = entity;

      for (let n = 0; n < players.length; n++) {
        const player = players[n];
        const distance = distanceToSquared(
          sceneObject.current.position,
          player.sceneObject.current.position,
        );

        if (distance < activateDistance && !entity.playerNear) {
          onWorldEvent("player-approach");
          entity.playerNear = true;
        } else if (distance > activateDistance && entity.playerNear) {
          onWorldEvent("player-leave");
          entity.playerNear = false;
        }
      }
    }
  });
}
