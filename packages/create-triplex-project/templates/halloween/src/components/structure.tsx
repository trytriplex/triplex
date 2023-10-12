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
    <Gltf
      castShadow
      position={position}
      receiveShadow
      rotation={rotation}
      scale={scale}
      src={`/assets/structure/${variant}.glb`}
    />
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
    <Gltf
      castShadow
      position={position}
      receiveShadow
      rotation={rotation}
      scale={scale}
      src={`/assets/structure/crypt.glb`}
    />
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
    <Gltf
      castShadow
      position={position}
      receiveShadow
      rotation={rotation}
      scale={scale}
      src={`/assets/structure/${variant}.glb`}
    />
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
    <Gltf
      castShadow
      position={position}
      receiveShadow
      rotation={rotation}
      src={`/assets/structure/${variant}.glb`}
    />
  );
}
