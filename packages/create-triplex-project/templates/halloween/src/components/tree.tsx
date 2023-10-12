import { Gltf } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Tree({
  position,
  rotation,
  scale,
  variant = "tree_dead_large",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?:
    | "tree_dead_large"
    | "tree_dead_large_decorated"
    | "tree_dead_medium"
    | "tree_dead_small"
    | "tree_pine_orange_large"
    | "tree_pine_orange_medium"
    | "tree_pine_orange_small"
    | "tree_pine_yellow_large"
    | "tree_pine_yellow_medium"
    | "tree_pine_yellow_small";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {variant === "tree_dead_large_decorated" && (
        <pointLight
          castShadow
          color={"#ffae3d"}
          intensity={5}
          position={[-0.81, 2.14, -0.38]}
        />
      )}
      <Gltf castShadow receiveShadow src={`/assets/tree/${variant}.glb`} />
    </group>
  );
}
