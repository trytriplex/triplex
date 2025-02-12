/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  Edges,
  Environment,
  MeshPortalMaterial,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { type Mesh } from "three";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FixedMeshPortalMaterial = MeshPortalMaterial as any;

export const App = () => (
  <>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <Edges />
      <SideMaterial bgColor="orange" index={0} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.65, 0.3, 64]} />
      </SideMaterial>
      <SideMaterial bgColor="lightblue" index={1} rotation={[0, Math.PI, 0]}>
        <torusKnotGeometry args={[0.55, 0.2, 128, 32]} />
      </SideMaterial>
      <SideMaterial
        bgColor="lightgreen"
        index={2}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
      >
        <boxGeometry args={[1.15, 1.15, 1.15]} />
      </SideMaterial>
      <SideMaterial
        bgColor="aquamarine"
        index={3}
        rotation={[0, Math.PI / 2, -Math.PI / 2]}
      >
        <octahedronGeometry />
      </SideMaterial>
      <SideMaterial
        bgColor={"#c8a2a2"}
        index={4}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <icosahedronGeometry />
      </SideMaterial>
      <SideMaterial bgColor="hotpink" index={5} rotation={[0, Math.PI / 2, 0]}>
        <dodecahedronGeometry />
      </SideMaterial>
    </mesh>

    <PerspectiveCamera
      makeDefault
      position={[
        3.317_577_190_874_2, 2.527_079_003_918_01, 4.306_459_235_636_1,
      ]}
      rotation={[
        -0.450_657_501_591_312_74, 0.603_082_885_621_224_3,
        0.203_490_234_514_988_3,
      ]}
    />
  </>
);

export function SideMaterial({
  bgColor = "#f0f0f0",
  children,
  index,
  rotation = [0, 0, 0],
}: {
  bgColor: string;
  children: ReactNode;
  index: number;
  rotation: [number, number, number];
}) {
  const mesh = useRef<Mesh>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/aobox-transformed.glb") as any;

  useFrame((_, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y += delta;
  });

  return (
    <FixedMeshPortalMaterial attach={`material-${index}`} worldUnits={false}>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
      <mesh
        castShadow
        geometry={nodes.Cube.geometry}
        receiveShadow
        rotation={rotation}
      >
        <meshStandardMaterial
          aoMap={nodes.Cube.material.aoMap}
          aoMapIntensity={1}
          color={bgColor}
        />
        <spotLight
          angle={0.15}
          castShadow
          color={bgColor}
          intensity={2}
          penumbra={1}
          position={[10, 10, 10]}
          shadow-bias={0.0001}
          shadow-normalBias={0.05}
        />
      </mesh>
      <mesh castShadow receiveShadow ref={mesh}>
        {children}
        <meshLambertMaterial color={bgColor} />
      </mesh>
    </FixedMeshPortalMaterial>
  );
}
