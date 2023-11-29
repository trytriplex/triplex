/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { Vector3Tuple } from "three";

export function Text({
  position,
  rotation,
  variant = "text_01",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?:
    | "text_01"
    | "text_02"
    | "text_03"
    | "text_01_arrow"
    | "text_02_arrow"
    | "text_03_arrow"
    | "text_caution";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh
        geometry={nodes[variant].geometry}
        material={nodes[variant].material}
      />
    </group>
  );
}
