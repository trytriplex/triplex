/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { type Vector3Tuple } from "three";
import { Shadow } from "./floor";

export function Mech({
  position,
  rotation,
  variant = "mech_blue",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "mech_blue" | "mech_green" | "mech_red";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh geometry={nodes[variant].geometry}>
        <meshStandardMaterial map={nodes[variant].material.map} />
      </mesh>
      {variant === "mech_red" && (
        <>
          <Shadow position={[-1.02, 0, 0]} />
          <Shadow position={[1.1, 0, 0]} />
        </>
      )}
      {variant === "mech_blue" && (
        <>
          <Shadow position={[-1.7, 0, 0.26]} />
          <Shadow position={[1.74, 0, 0.22]} />
        </>
      )}
      {variant === "mech_green" && (
        <>
          <Shadow position={[-0.84, 0, -1.2]} />
          <Shadow position={[-0.86, 0, 0.2]} />
          <Shadow position={[0.92, 0, 1.36]} />
        </>
      )}
    </group>
  );
}
