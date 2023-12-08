/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Object({
  position,
  rotation,
  variant = "object_box",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "object_box" | "object_sign" | "object_lights" | "object_person";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh geometry={nodes[variant].geometry}>
        <meshStandardMaterial
          alphaMap={nodes[variant].material.alphaMap}
          map={nodes[variant].material.map}
          metalness={1}
          side={2}
          transparent
        />
      </mesh>
    </group>
  );
}
