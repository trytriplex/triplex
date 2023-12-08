/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useAnimations } from "@react-three/drei";
import { useCallback, useEffect, useState } from "react";
import { Component } from "../ecs/store";
import { type OnWorldEventHandler } from "../ecs/types";
import { InventoryIcon } from "../systems/inventory";
import { type Vector3Tuple } from "../types";
import { useGLTF } from "../utils/gltf";
import { PointerEntity } from "./pointer-entity";
import { SceneEntity } from "./scene-entity";

const anims = {
  idle: "chicken_with_animation_1",
  moving: "chicken_with_animation_2",
};

const DEFAULT_POSITION: Vector3Tuple = [0, 0, 0];

export function PlayerEntity({
  position = DEFAULT_POSITION,
}: {
  position?: Vector3Tuple;
}) {
  const { animations, scene } = useGLTF("/chkn/scene.gltf");
  const { actions, ref } = useAnimations(animations);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [state, setState] = useState<"idle" | "moving">("idle");

  scene.traverse((obj) => {
    obj.castShadow = true;
  });

  useEffect(() => {
    actions[anims[state]]?.reset().fadeIn(0.1).play();

    return () => {
      actions[anims[state]]?.fadeOut(0.1);
    };
  }, [actions, state]);

  const onWorldEvent: OnWorldEventHandler = useCallback((event) => {
    switch (event) {
      case "move-stop":
        setState("idle");
        break;

      case "move-start":
        setState("moving");
        break;

      default:
        break;
    }
  }, []);

  return (
    <>
      <SceneEntity
        components={
          <>
            {inventoryOpen ? (
              <>
                <Component data={{ x: 0, y: -0.75, z: 0 }} name="offset" />
                <Component data={1.5} name="zoom" />
              </>
            ) : (
              <PointerEntity onClick={() => {}} />
            )}

            <Component initialData={{}} name="inventory" />
            <Component data={true} name="player" />
            <Component data={true} name="focused" />
            <Component data={onWorldEvent} name="onWorldEvent" />
          </>
        }
        position={position}
        speed={5}
      >
        <group scale={[0.5, 0.5, 0.5]}>
          <primitive name="player" object={scene} ref={ref} />
        </group>
      </SceneEntity>

      <InventoryIcon
        onToggle={() => setInventoryOpen((prev) => !prev)}
        open={inventoryOpen}
      />
    </>
  );
}
