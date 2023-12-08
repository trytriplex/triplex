/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { type Vector3Tuple } from "three";
import { Object } from "./object";
import { Platform } from "./platform";
import { Text } from "./text";

export function Shadow({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh
        geometry={nodes.floor_splat_large.geometry}
        material={nodes.floor_splat_large.material}
      />
    </group>
  );
}

export function Floor({
  position,
  rotation,
  variant = "floor_rect",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?:
    | "floor_cables"
    | "floor_line_parallel_small"
    | "floor_line_parallel"
    | "floor_line"
    | "floor_rect_edge"
    | "floor_rect_large"
    | "floor_rect_small"
    | "floor_rect_thin"
    | "floor_rect_thin_large"
    | "floor_rect"
    | "floor_splat"
    | "floor_target_line"
    | "floor_target_large"
    | "floor_target_small";
}) {
  const { nodes } = useGLTF("assets/mecha.glb");

  return (
    <group dispose={null} position={position} rotation={rotation}>
      <mesh geometry={nodes[variant].geometry}>
        <meshStandardMaterial
          alphaMap={nodes[variant].material.alphaMap}
          map={nodes[variant].material.map}
          transparent
        />
      </mesh>
    </group>
  );
}

export function MechPlate({
  number = 1,
  position,
  rotation,
}: {
  number?: 1 | 2 | 3;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Text
        position={[2.6, 8.32, -11.56]}
        rotation={[1.570_796_326_794_896_6, 0, 0]}
        variant={`text_0${number}`}
      />
      <group
        name={"mech-plate"}
        position={[0, 3.9, -10.88]}
        rotation={[1.308_996_938_995_747_2, 0, 0]}
      >
        <Floor
          position={[0, 0.02, -2.26]}
          rotation={[0, 3.141_592_653_589_793, 0]}
          variant={"floor_rect_edge"}
        />
        <Floor position={[0, 0, 0]} rotation={[0, 0, 0]} />
      </group>
      <Floor position={[0, 0.02, 0.02]} />

      <Floor
        position={[0, 10.1, -11.66]}
        rotation={[1.570_796_326_794_896_6, 0, 0]}
      />
      <Floor position={[0, 0, -4.94]} variant={"floor_rect_thin_large"} />
      <Floor position={[0, 0, -8.24]} variant={"floor_rect_thin_large"} />
      <Floor position={[0, 0, 6.04]} variant={"floor_rect_thin_large"} />
      <Floor
        position={[0, 0, 4.98]}
        rotation={[3.141_592_653_589_793, 0, 3.141_592_653_589_793]}
        variant={"floor_rect_edge"}
      />

      <Floor position={[0, 0, 0]} variant={"floor_target_large"} />
      <Floor position={[0, 0, 12.52]} variant={"floor_rect_large"} />
      <Floor position={[1.66, 0.02, 10.66]} variant={"floor_rect_thin"} />
      <Floor position={[-3.48, 0.02, 10.84]} variant={"floor_target_small"} />
      <Object
        position={[0, 12.38, -11.26]}
        rotation={[0.314_159_265_358_979_3, 0, 3.141_592_653_589_793]}
        variant={"object_lights"}
      />
      <Text position={[0, 0, 4.9]} variant={"text_caution"} />
      <Text
        position={[-0.77, 0, 10.6]}
        rotation={[0, 1.570_796_326_794_896_6, 0]}
        variant={`text_0${number}_arrow`}
      />
      <Platform position={[0, 0, 7.88]} variant={"platform_edge"} />
    </group>
  );
}
