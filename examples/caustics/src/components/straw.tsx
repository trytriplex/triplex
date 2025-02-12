/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { type Vector3Tuple } from "three";

export function Straw({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { materials, nodes } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.straw_1.geometry.center();
    nodes.straw_2.geometry.center();
  }, [nodes.straw_1.geometry, nodes.straw_2.geometry]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        castShadow
        dispose={null}
        geometry={nodes.straw_1.geometry}
        material={materials.straw_2}
      />
      <mesh
        castShadow
        dispose={null}
        geometry={nodes.straw_2.geometry}
        material={materials.straw_1}
      />
    </group>
  );
}
