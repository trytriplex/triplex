import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useQueryFirst } from "koota/react";
import React, { useLayoutEffect, useRef, type ReactNode } from "react";
import { type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { IsEkka, State } from "../../entities/ekka/traits";
import { Position } from "../../entities/shared/traits";
import { IsXRPlayer } from "../../entities/xr-player/traits";
import { damp } from "../../lib/math";

type GLTFResult = {
  materials: {
    Gray: MeshStandardMaterial;
    ["Gray.001"]: MeshStandardMaterial;
    ["Gray.002"]: MeshStandardMaterial;
    ["Material.001"]: MeshStandardMaterial;
    Red: MeshStandardMaterial;
    black: MeshStandardMaterial;
    ["black.001"]: MeshStandardMaterial;
    ["black.002"]: MeshStandardMaterial;
    ["black.004"]: MeshStandardMaterial;
    flappy: MeshStandardMaterial;
    glow: MeshStandardMaterial;
    ["glow.001"]: MeshStandardMaterial;
    ["glow.red"]: MeshStandardMaterial;
    metal: MeshStandardMaterial;
    red: MeshStandardMaterial;
    white: MeshStandardMaterial;
    ["white.001"]: MeshStandardMaterial;
    ["white.003"]: MeshStandardMaterial;
  };
  nodes: {
    BezierCurve: Mesh;
    Circle001_1: Mesh;
    Circle001_2: Mesh;
    Circle002: Mesh;
    Circle_1: Mesh;
    Circle_2: Mesh;
    Circle_3: Mesh;
    Cube001: Mesh;
    Cube001_1: Mesh;
    Cube001_2: Mesh;
    Cube002: Mesh;
    Cube002_1: Mesh;
    Cube002_2: Mesh;
    Cube002_3: Mesh;
    Cube002_4: Mesh;
    Cube003_1: Mesh;
    Cube003_2: Mesh;
    Cube003_3: Mesh;
    Cube003_4: Mesh;
    Cube004: Mesh;
    Cube004_1: Mesh;
    Cube005: Mesh;
    Cube005_1: Mesh;
    Cube005_2: Mesh;
    Cube006_1: Mesh;
    Cube006_2: Mesh;
    Cube006_3: Mesh;
    Cube006_4: Mesh;
    Cube007: Mesh;
    Cube010: Mesh;
    Cube010_1: Mesh;
    Cube011: Mesh;
    Cube013: Mesh;
    Cube013_1: Mesh;
    Cube013_2: Mesh;
    Cube013_3: Mesh;
    Cube014: Mesh;
    Cube015_1: Mesh;
    Cube015_2: Mesh;
    Cube015_3: Mesh;
    Cube015_4: Mesh;
    Cube016: Mesh;
    Cube028: Mesh;
    Cube028_1: Mesh;
    Cube029: Mesh;
    Cube029_1: Mesh;
    Cube029_2: Mesh;
    Cube031: Mesh;
    Cube031_1: Mesh;
    Cube031_2: Mesh;
    Cube031_3: Mesh;
    Cube036: Mesh;
    Cube038_1: Mesh;
    Cube038_2: Mesh;
    Cube038_3: Mesh;
    Cube038_4: Mesh;
    Cube038_5: Mesh;
    Cube038_6: Mesh;
    Cube063: Mesh;
    Cube063_1: Mesh;
    Cube064: Mesh;
    Cube064_1: Mesh;
    Cube064_2: Mesh;
    Cube066: Mesh;
    Cube066_1: Mesh;
    Cube066_2: Mesh;
    Cube066_3: Mesh;
    Cylinder001_1: Mesh;
    Cylinder001_2: Mesh;
    Cylinder001_3: Mesh;
    Cylinder007: Mesh;
    Cylinder007_1: Mesh;
    Cylinder009: Mesh;
    Cylinder009_1: Mesh;
    Cylinder019: Mesh;
    Cylinder019_1: Mesh;
    Plane: Mesh;
    Plane001: Mesh;
    Torus: Mesh;
  };
};

export function Kasa({ children }: { children?: ReactNode }) {
  const { materials, nodes } = useGLTF(
    "/assets/kasa.glb",
  ) as never as GLTFResult;
  const headRef = useRef<Object3D>(null);
  const lookAtPlaceholder = useRef<Object3D>(null);
  const player = useQueryFirst(IsXRPlayer, Position);
  const scene = useThree((store) => store.scene);
  const ekka = useQueryFirst(IsEkka, State);

  useLayoutEffect(() => {
    // Set initial position of the placeholder.
    const playerPosition = player?.get(Position);
    if (!playerPosition || !lookAtPlaceholder.current || !headRef.current) {
      return;
    }

    lookAtPlaceholder.current.position.copy(playerPosition);
  }, [player]);

  useFrame((_, delta) => {
    const state = ekka?.get(State);
    const playerPosition = player?.get(Position);
    if (!playerPosition || !lookAtPlaceholder.current || !headRef.current) {
      return;
    }

    const targetPosition =
      state?.value === "idle"
        ? { x: 0, y: 10, z: playerPosition.z }
        : { x: playerPosition.x, y: -20, z: playerPosition.z };

    const nextPosition = damp(
      lookAtPlaceholder.current.position,
      targetPosition,
      0.1,
      delta,
    );

    lookAtPlaceholder.current.position.copy(nextPosition);
    headRef.current.lookAt(lookAtPlaceholder.current.position);
  });

  return (
    <group dispose={null}>
      {createPortal(<group ref={lookAtPlaceholder} />, scene)}
      <group name={"coat"} position={[0, 1.778, -0.037]}>
        <mesh
          castShadow
          geometry={nodes.Circle001_1.geometry}
          material={materials.Gray}
          receiveShadow
        />
        <mesh
          castShadow
          geometry={nodes.Circle001_2.geometry}
          material={materials.metal}
          receiveShadow
        />
      </group>
      <group position={[0, 1.06, 0]}>
        <mesh
          castShadow
          geometry={nodes.Cylinder007.geometry}
          material={materials["black.002"]}
          receiveShadow
        />
        <mesh
          castShadow
          geometry={nodes.Cylinder007_1.geometry}
          material={materials["Gray.001"]}
          receiveShadow
        />
        <group position={[0, -0.018, 0.052]} rotation={[-0.175, 0, 0]}>
          <mesh
            castShadow
            geometry={nodes.Cylinder001_1.geometry}
            material={materials.metal}
            receiveShadow
          />
          <mesh
            castShadow
            geometry={nodes.Cylinder001_2.geometry}
            material={materials["black.002"]}
            receiveShadow
          />
          <mesh
            castShadow
            geometry={nodes.Cylinder001_3.geometry}
            material={materials.Red}
            receiveShadow
          />
          <mesh
            castShadow
            geometry={nodes.Cube005.geometry}
            material={materials.black}
            name={"head"}
            position={[0.009, 0.312, -0.001]}
            receiveShadow
            ref={headRef}
            rotation={[0.649, -0.028, 0.054]}
          >
            <mesh
              castShadow
              geometry={nodes.Circle002.geometry}
              material={materials.glow}
              position={[0.037, 0.512, -0.249]}
              receiveShadow
              rotation={[-0.487, 0.001, -0.052]}
            />
            {children}
            <group
              position={[0.001, 0.208, -0.047]}
              rotation={[-0.472, 0.049, -0.035]}
            >
              <mesh
                castShadow
                geometry={nodes.Cube010.geometry}
                material={materials.black}
                receiveShadow
              />
              <group position={[0, 0.18, -0.029]}>
                <mesh
                  castShadow
                  geometry={nodes.Circle_1.geometry}
                  material={materials.white}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Circle_2.geometry}
                  material={materials.Gray}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Circle_3.geometry}
                  material={materials.black}
                  receiveShadow
                />
              </group>
              <mesh
                castShadow
                geometry={nodes.Cube016.geometry}
                material={materials.Red}
                position={[0, 0.09, 0.092]}
                receiveShadow
                rotation={[0.051, -0.013, -0.011]}
              />
              <group
                position={[0.002, -0.01, 0.032]}
                rotation={[0.49, -0.06, 0.017]}
              >
                <mesh
                  castShadow
                  geometry={nodes.Cube015_1.geometry}
                  material={materials.Gray}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube015_2.geometry}
                  material={materials["white.003"]}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube015_3.geometry}
                  material={materials["Gray.002"]}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube015_4.geometry}
                  material={materials.black}
                  receiveShadow
                />

                <mesh
                  castShadow
                  geometry={nodes.Cube014.geometry}
                  material={materials.Gray}
                  position={[-0.035, 0.065, 0.097]}
                  receiveShadow
                  rotation={[0.216, 0.027, 0.089]}
                />
              </group>
              <mesh
                castShadow
                geometry={nodes.Torus.geometry}
                material={materials.black}
                position={[0.009, 0.222, -0.068]}
                receiveShadow
                rotation={[0.129, -0.069, -0.032]}
              />
            </group>
          </mesh>
          <group
            name={"left-arm"}
            position={[0.196, 0.397, 0.043]}
            rotation={[0.233, -0.006, -0.412]}
          >
            <mesh
              castShadow
              geometry={nodes.Cylinder019.geometry}
              material={materials["black.001"]}
              receiveShadow
            />
            <mesh
              castShadow
              geometry={nodes.Cylinder019_1.geometry}
              material={materials.red}
              receiveShadow
            />
            <group
              position={[0.091, -0.021, 0.008]}
              rotation={[2.339, -0.943, 2.599]}
              scale={1.818}
            >
              <mesh
                castShadow
                geometry={nodes.Cube063.geometry}
                material={materials.Gray}
                receiveShadow
              />
              <mesh
                castShadow
                geometry={nodes.Cube063_1.geometry}
                material={materials["black.001"]}
                receiveShadow
              />
              <group
                position={[-0.018, -0.229, -0.004]}
                rotation={[0.052, 0.507, -0.944]}
                scale={0.863}
              >
                <mesh
                  castShadow
                  geometry={nodes.Cube064.geometry}
                  material={materials.Gray}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube064_1.geometry}
                  material={materials["black.001"]}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube064_2.geometry}
                  material={materials.red}
                  receiveShadow
                />
                <mesh
                  castShadow
                  geometry={nodes.Cube036.geometry}
                  material={materials.black}
                  position={[0.195, -0.078, -0.022]}
                  receiveShadow
                  rotation={[1.77, 0.232, 1.33]}
                  scale={1.155}
                >
                  <group
                    position={[-0.008, -0.074, 0.053]}
                    rotation={[1.616, 0.83, -1.959]}
                    scale={0.55}
                  >
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_1.geometry}
                      material={materials["black.004"]}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_2.geometry}
                      material={materials["white.001"]}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_3.geometry}
                      material={materials.metal}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_4.geometry}
                      material={materials["Material.001"]}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_5.geometry}
                      material={materials.Gray}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube038_6.geometry}
                      material={materials["glow.001"]}
                      receiveShadow
                    />
                  </group>
                  <group
                    position={[-0.017, -0.018, 0.012]}
                    rotation={[-0.697, 0.463, -2.961]}
                  >
                    <mesh
                      castShadow
                      geometry={nodes.Cube066.geometry}
                      material={materials.metal}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube066_1.geometry}
                      material={materials.black}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube066_2.geometry}
                      material={materials.Gray}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube066_3.geometry}
                      material={materials["black.001"]}
                      receiveShadow
                    />
                  </group>
                  <group
                    position={[0.018, -0.04, 0.08]}
                    rotation={[-1.606, -0.686, -0.01]}
                  >
                    <mesh
                      castShadow
                      geometry={nodes.Cube006_1.geometry}
                      material={materials.metal}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube006_2.geometry}
                      material={materials.black}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube006_3.geometry}
                      material={materials.Gray}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube006_4.geometry}
                      material={materials["black.001"]}
                      receiveShadow
                    />
                  </group>
                  <group
                    position={[0.032, -0.015, 0.089]}
                    rotation={[-1.588, -0.737, 0.03]}
                  >
                    <mesh
                      castShadow
                      geometry={nodes.Cube003_1.geometry}
                      material={materials.metal}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube003_2.geometry}
                      material={materials.black}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube003_3.geometry}
                      material={materials.Gray}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube003_4.geometry}
                      material={materials["black.001"]}
                      receiveShadow
                    />
                  </group>
                  <group
                    position={[0.054, -0.001, 0.085]}
                    rotation={[-1.578, -0.765, 0.054]}
                  >
                    <mesh
                      castShadow
                      geometry={nodes.Cube002_1.geometry}
                      material={materials.metal}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube002_2.geometry}
                      material={materials.black}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube002_3.geometry}
                      material={materials.Gray}
                      receiveShadow
                    />
                    <mesh
                      castShadow
                      geometry={nodes.Cube002_4.geometry}
                      material={materials["black.001"]}
                      receiveShadow
                    />
                  </group>
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
