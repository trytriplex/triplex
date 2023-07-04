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
  scale,
  position,
  rotation,
}: {
  color?: string;
  scale?: Vector3Tuple;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.fork.geometry.center();
  }, [nodes.fork.geometry]);

  return (
    <mesh
      dispose={null}
      scale={scale}
      position={position}
      rotation={rotation}
      castShadow
      geometry={nodes.fork.geometry}
      material={materials.ForkAndKnivesSet001_1K}
      material-color={color}
    />
  );
}
