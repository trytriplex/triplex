import { Gltf } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Shrine({
  position,
  rotation,
  scale,
  variant = "shrine_candles",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?: "pillar" | "shrine" | "shrine_candles";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/structure/${variant}.glb`} />
    </group>
  );
}

export function Crypt({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/structure/crypt.glb`} />
    </group>
  );
}

export function Coffin({
  position,
  rotation,
  scale,
  variant = "coffin",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?: "coffin" | "coffin_decorated";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/structure/${variant}.glb`} />
    </group>
  );
}

export function Grave({
  position,
  rotation,
  variant = "grave_A",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?:
    | "grave_A"
    | "grave_A_destroyed"
    | "grave_B"
    | "gravemarker_A"
    | "gravemarker_B"
    | "gravestone";
}) {
  return (
    <group position={position} rotation={rotation}>
      <Gltf castShadow receiveShadow src={`/assets/structure/${variant}.glb`} />
    </group>
  );
}
