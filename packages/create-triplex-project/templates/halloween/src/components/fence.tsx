import { Gltf } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Fence({
  position,
  rotation,
  scale,
  variant = "fence",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?:
    | "fence"
    | "fence_broken"
    | "fence_gate"
    | "fence_seperate"
    | "fence_seperate_broken";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/fence/${variant}.glb`} />
    </group>
  );
}

export function Post({
  position,
  rotation,
  scale,
  variant = "post",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?:
    | "post"
    | "post_lantern"
    | "post_skull"
    | "fence_pillar"
    | "fence_pillar_broken";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {variant === "post_lantern" && (
        <pointLight
          castShadow
          color={"#ffae3d"}
          intensity={5}
          position={[0, 2, 1]}
        />
      )}

      <Gltf castShadow receiveShadow src={`/assets/fence/${variant}.glb`} />
    </group>
  );
}
