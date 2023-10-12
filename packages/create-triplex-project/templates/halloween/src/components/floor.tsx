import { Clone, Gltf, useGLTF } from "@react-three/drei";
import { MeshStandardMaterial, Object3D, type Vector3Tuple } from "three";
import { Primitive } from "../util/primitive";

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
    <Gltf
      castShadow
      position={position}
      receiveShadow
      rotation={rotation}
      scale={scale}
      src={`/assets/floor/${variant}.glb`}
    />
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
    <>
      <Primitive object={material} roughness={1} />
      <Clone
        castShadow
        object={node.scene}
        position={position}
        receiveShadow
        rotation={rotation}
        scale={scale}
      />
    </>
  );
}
