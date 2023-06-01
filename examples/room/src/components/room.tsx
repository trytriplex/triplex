import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Material, Mesh } from "three";

interface ObjectProps {
  position?: [x: number, y: number, z: number];
  scale?: [x: number, y: number, z: number] | number;
  rotation?: [x: number, y: number, z: number];
}

type GLTF = ReturnType<typeof useGLTF> & {
  nodes: Record<string, Mesh>;
  materials: Record<string, Material>;
};

export function Wall({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.Material}
        />
      </group>
    </group>
  );
}

export function Floor({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_10.geometry}
          material={materials.podloga}
        />
      </group>
    </group>
  );
}

export function BackWall({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_11.geometry}
          material={materials.sciana_okno}
        />
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials["Material.002"]}
        />
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_14.geometry}
          material={materials["Material.002"]}
        />
      </group>
    </group>
  );
}

export function Table({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_12.geometry}
          material={materials["stolik.001"]}
        />
      </group>
    </group>
  );
}

export function CollectionOfCans({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_16.geometry}
          material={materials["Material.006"]}
        />
      </group>
    </group>
  );
}

export function TableBox({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials["Material.004"]}
        />
      </group>
    </group>
  );
}

export function WallpaperAndLights({ position, scale, rotation }: ObjectProps) {
  const { nodes } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh dispose={null} geometry={nodes.Object_13.geometry}>
          <meshStandardMaterial transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export function Lamps({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_15.geometry}
          material={materials["Material.005"]}
        />
      </group>
    </group>
  );
}

export function FloorPlanks({ position, scale, rotation }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_18.geometry}
          material={materials.stolik}
        />
      </group>
    </group>
  );
}

export function Seat({ position, rotation, scale }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={materials.krzeslo_1}
        />
      </group>
    </group>
  );
}

export function SeatMats({ position, rotation, scale }: ObjectProps) {
  const { nodes, materials } = useGLTF("/room-transformed.glb") as GLTF;

  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => node.geometry?.center());
  }, [nodes]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group scale={0.5} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.Object_17.geometry}
          material={materials.mata}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/room-transformed.glb");
