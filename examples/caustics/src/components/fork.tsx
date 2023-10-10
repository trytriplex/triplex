/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Vector3Tuple } from "three";

export function Fork({
  color,
  position,
  rotation,
  scale,
}: {
  color?: string;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { materials, nodes } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.fork.geometry.center();
  }, [nodes.fork.geometry]);

  return (
    <mesh
      castShadow
      dispose={null}
      geometry={nodes.fork.geometry}
      material={materials.ForkAndKnivesSet001_1K}
      material-color={color}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
