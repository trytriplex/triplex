import { Gltf } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Item({
  position,
  rotation,
  scale,
  variant = "bone_A",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?:
    | "bone_A"
    | "bone_B"
    | "bone_C"
    | "candle"
    | "candle_melted"
    | "candle_thin"
    | "candle_triple"
    | "cauldron"
    | "chest"
    | "lantern_hanging"
    | "lantern_standing"
    | "plaque"
    | "plaque_candles"
    | "ribcage"
    | "skull"
    | "skull_candle";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/item/${variant}.glb`} />
    </group>
  );
}
