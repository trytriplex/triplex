/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Vector3Tuple } from "three";

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
