/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { Vector3Tuple } from "three";
import { Floor, Shadow } from "./floor";
import { Object } from "./object";
import { Platform } from "./platform";

export function Railing({
  position,
  rotation,
  variant = "railing",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "railing" | "railing_small";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh
        castShadow={false}
        geometry={nodes[variant].geometry}
        receiveShadow={false}
      >
        <meshStandardMaterial
          alphaMap={nodes[variant].material.alphaMap}
          map={nodes[variant].material.map}
          metalness={2}
          side={2}
          transparent
        />
      </mesh>
    </group>
  );
}

export function RailingPlatform({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Railing position={[0, 0, -2.6]} />
      <Railing position={[0, 0, -7.2]} />
      <Railing position={[0, 6.5, -7.2]} />
      <Railing position={[0, 0, 2.48]} />
      <Floor
        rotation={[
          3.141_592_653_589_793, -1.570_796_326_794_896_6,
          3.141_592_653_589_793,
        ]}
        variant={"floor_rect_thin_large"}
      />
      <Shadow
        position={[0.04, 0, -2.58]}
        rotation={[
          3.141_592_653_589_793, -1.570_796_326_794_896_6,
          3.141_592_653_589_793,
        ]}
      />
      <Shadow
        position={[0.04, 0, 2.72]}
        rotation={[
          3.141_592_653_589_793, -1.570_796_326_794_896_6,
          3.141_592_653_589_793,
        ]}
      />
      <Platform
        position={[0, 6.52, 0.36]}
        rotation={[0, 1.570_796_326_794_896_6, 0]}
      />
      <Platform
        position={[0, 1.34, 0.08]}
        rotation={[0, 1.570_796_326_794_896_6, 0]}
      />
      <Object
        position={[1, 6.96, 2.14]}
        rotation={[
          1.570_796_326_794_896_6, 1.134_464_013_796_314_2,
          1.570_796_326_794_896_6,
        ]}
        variant={"object_lights"}
      />
      <Object
        position={[-0.960_000_000_000_001, 6.96, 2.14]}
        rotation={[
          1.570_796_326_794_896_6, -1.134_464_013_796_314_2,
          -1.570_796_326_794_896_6,
        ]}
        variant={"object_lights"}
      />
    </group>
  );
}
