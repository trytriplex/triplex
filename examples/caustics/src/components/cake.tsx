/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Vector3Tuple } from "three";

export function Cake({
  scale,
  position,
  rotation,
}: {
  scale?: Vector3Tuple;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.cake.geometry.center();
  }, [nodes.cake.geometry]);

  return (
    <mesh
      dispose={null}
      castShadow
      scale={scale}
      rotation={rotation}
      position={position}
      geometry={nodes.cake.geometry}
      material={materials.FruitCakeSlice_u1_v1}
    />
  );
}
