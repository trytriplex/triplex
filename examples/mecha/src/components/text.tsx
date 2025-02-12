/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useGLTF } from "@react-three/drei";
import { type Vector3Tuple } from "three";

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
