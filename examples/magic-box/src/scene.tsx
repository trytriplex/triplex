/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ReactNode, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Edges,
  MeshPortalMaterial,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { type Mesh } from "three";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FixedMeshPortalMaterial = MeshPortalMaterial as any;

export const App = () => (
  <>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <Edges />
      <SideMaterial rotation={[0, 0, 0]} bgColor="orange" index={0}>
        <torusGeometry args={[0.65, 0.3, 64]} />
      </SideMaterial>
      <SideMaterial rotation={[0, Math.PI, 0]} bgColor="lightblue" index={1}>
        <torusKnotGeometry args={[0.55, 0.2, 128, 32]} />
      </SideMaterial>
      <SideMaterial
        rotation={[0, Math.PI / 2, Math.PI / 2]}
        bgColor="lightgreen"
        index={2}
      >
        <boxGeometry args={[1.15, 1.15, 1.15]} />
      </SideMaterial>
      <SideMaterial
        rotation={[0, Math.PI / 2, -Math.PI / 2]}
        bgColor="aquamarine"
        index={3}
      >
        <octahedronGeometry />
      </SideMaterial>
      <SideMaterial
        rotation={[0, -Math.PI / 2, 0]}
        bgColor={"#c8a2a2"}
        index={4}
      >
        <icosahedronGeometry />
      </SideMaterial>
      <SideMaterial rotation={[0, Math.PI / 2, 0]} bgColor="hotpink" index={5}>
        <dodecahedronGeometry />
      </SideMaterial>
    </mesh>

    <PerspectiveCamera
      makeDefault
      position={[3.3175771908742, 2.52707900391801, 4.3064592356361]}
      rotation={[-0.45065750159131274, 0.6030828856212243, 0.2034902345149883]}
    />
  </>
);

export function SideMaterial({
  rotation = [0, 0, 0],
  bgColor = "#f0f0f0",
  children,
  index,
}: {
  rotation: [number, number, number];
  bgColor: string;
  children: ReactNode;
  index: number;
}) {
  const mesh = useRef<Mesh>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/aobox-transformed.glb") as any;

  useFrame((_, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y += delta;
  });

  return (
    <FixedMeshPortalMaterial worldUnits={false} attach={`material-${index}`}>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
      <mesh
        castShadow
        receiveShadow
        rotation={rotation}
        geometry={nodes.Cube.geometry}
      >
        <meshStandardMaterial
          aoMapIntensity={1}
          aoMap={nodes.Cube.material.aoMap}
          color={bgColor}
        />
        <spotLight
          castShadow
          color={bgColor}
          intensity={2}
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          shadow-normalBias={0.05}
          shadow-bias={0.0001}
        />
      </mesh>
      <mesh castShadow receiveShadow ref={mesh}>
        {children}
        <meshLambertMaterial color={bgColor} />
      </mesh>
    </FixedMeshPortalMaterial>
  );
}
