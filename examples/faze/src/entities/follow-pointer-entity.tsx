import { useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { world, Entities, Component } from "../ecs/store";

function Placeholder() {
  const map = useTexture("/textures/dark/texture_03.png");

  return (
    <mesh raycast={() => false}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial map={map} depthTest={false} transparent />
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
