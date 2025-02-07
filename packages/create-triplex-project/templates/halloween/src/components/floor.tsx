import { Clone, Gltf, useGLTF } from "@react-three/drei";
import {
  type MeshStandardMaterial,
  type Object3D,
  type Vector3Tuple,
} from "three";

export function Path({
  position,
  rotation,
  scale,
  variant = "path_A",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?: "path_A" | "path_B" | "path_C" | "path_D";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/floor/${variant}.glb`} />
    </group>
  );
}

export function Floor({
  position,
  rotation,
  scale,
  variant = "floor_dirt",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?: "floor_dirt" | "floor_dirt_grave" | "floor_dirt_small";
}) {
  const node = useGLTF(`/assets/floor/${variant}.glb`) as never as {
    materials: Record<string, MeshStandardMaterial>;
    scene: Object3D;
  };
  const material = node.materials["HalloweenBits"];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={material} roughness={1} />
      <Clone castShadow object={node.scene} receiveShadow />
    </group>
  );
}
