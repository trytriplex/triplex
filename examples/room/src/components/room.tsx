/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { type Material, type Mesh } from "three";

interface ObjectProps {
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];
  scale?: [x: number, y: number, z: number] | number;
}

type GLTF = ReturnType<typeof useGLTF> & {
  materials: Record<string, Material>;
  nodes: Record<string, Mesh>;
};

export function Wall({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_2.geometry}
          material={materials.Material}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function Floor({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_10.geometry}
          material={materials.podloga}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function BackWall({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_11.geometry}
          material={materials.sciana_okno}
          receiveShadow
        />
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_3.geometry}
          material={materials["Material.002"]}
          receiveShadow
        />
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_14.geometry}
          material={materials["Material.002"]}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function Table({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_12.geometry}
          material={materials["stolik.001"]}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function CollectionOfCans({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_16.geometry}
          material={materials["Material.006"]}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function TableBox({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_5.geometry}
          material={materials["Material.004"]}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function WallpaperAndLights({ position, rotation, scale }: ObjectProps) {
  const { nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh dispose={null} geometry={nodes.Object_13.geometry}>
          <meshStandardMaterial opacity={0.5} transparent />
        </mesh>
      </group>
    </group>
  );
}

export function Lamps({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_15.geometry}
          material={materials["Material.005"]}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function FloorPlanks({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_18.geometry}
          material={materials.stolik}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function Seat({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_6.geometry}
          material={materials.krzeslo_1}
          receiveShadow
        />
      </group>
    </group>
  );
}

export function SeatMats({ position, rotation, scale }: ObjectProps) {
  const { materials, nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.Object_17.geometry}
          material={materials.mata}
          receiveShadow
        />
      </group>
    </group>
  );
}

useGLTF.preload("/room-transformed.glb");
