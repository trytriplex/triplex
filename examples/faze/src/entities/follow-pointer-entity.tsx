/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { Component, Entities, world } from "../ecs/store";

function Placeholder() {
  const map = useTexture("/textures/dark/texture_03.png");

  return (
    <mesh raycast={() => false}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial depthTest={false} map={map} transparent />
    </mesh>
  );
}

export function FollowPointerEntity() {
  return (
    <Entities in={world.with("followPointer")}>
      <Component name="sceneObject">
        <group>
          <Suspense fallback={null}>
            <Placeholder />
          </Suspense>
        </group>
      </Component>
    </Entities>
  );
}
