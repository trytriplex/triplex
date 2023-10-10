/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { distanceToSquared } from "../../math/vectors";
import { noop } from "../../utils/functions";
import { world } from "../store";

export function usePlayerApproach() {
  const { entities } = useEntities(world.with("playerNear", "sceneObject"));
  const { entities: players } = useEntities(
    world.with("player", "sceneObject")
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
          player.sceneObject.current.position
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
