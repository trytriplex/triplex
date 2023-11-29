/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { Vector3Tuple } from "three";

export function Platform({
  position,
  rotation,
  variant = "platform",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?:
    | "platform"
    | "platform_edge"
    | "platform_entrance"
    | "platform_lift"
    | "platform_lift_raised"
    | "platform_small"
    | "platform_stairs";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh geometry={nodes[variant].geometry}>
        <meshStandardMaterial
          alphaMap={nodes[variant].material.alphaMap}
          map={nodes[variant].material.map}
          metalness={2}
          side={2}
          transparent
        />
      </mesh>
    </group>
  );
}
