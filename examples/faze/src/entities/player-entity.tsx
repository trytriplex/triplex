import { useAnimations } from "@react-three/drei";
import { useGLTF } from "../utils/gltf";
import { useCallback, useEffect, useState } from "react";
import { Component } from "../ecs/store";
import { SceneEntity } from "./scene-entity";
import { InventoryIcon } from "../systems/inventory";
import { OnWorldEventHandler } from "../ecs/types";
import { PointerEntity } from "./pointer-entity";
import { Vector3Tuple } from "../types";

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
  const { scene, animations } = useGLTF("/chkn/scene.gltf");
  const { ref, actions } = useAnimations(animations);
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
                <Component name="offset" data={{ x: 0, y: -0.75, z: 0 }} />
                <Component name="zoom" data={1.5} />
              </>
            ) : (
              <PointerEntity onClick={() => {}} />
            )}

            <Component name="inventory" initialData={{}} />
            <Component name="player" data={true} />
            <Component name="focused" data={true} />
            <Component name="onWorldEvent" data={onWorldEvent} />
          </>
        }
        speed={5}
        position={position}
      >
        <group scale={[0.5, 0.5, 0.5]}>
          <primitive name="player" ref={ref} object={scene} />
        </group>
      </SceneEntity>

      <InventoryIcon
        open={inventoryOpen}
        onToggle={() => setInventoryOpen((prev) => !prev)}
      />
    </>
  );
}
