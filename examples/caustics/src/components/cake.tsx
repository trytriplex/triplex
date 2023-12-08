/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { type Vector3Tuple } from "three";

export function Cake({
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
    nodes.cake.geometry.center();
  }, [nodes.cake.geometry]);

  return (
    <mesh
      castShadow
      dispose={null}
      geometry={nodes.cake.geometry}
      material={materials.FruitCakeSlice_u1_v1}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
