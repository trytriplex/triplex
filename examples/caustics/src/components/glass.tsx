/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import * as THREE from "three";
import { useGLTF, Caustics, MeshTransmissionMaterial } from "@react-three/drei";
import { Vector3Tuple } from "three";
import { useLayoutEffect, useMemo } from "react";

export function Glass({
  scale,
  position,
  rotation,
}: {
  scale?: Vector3Tuple;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/glass-transformed.glb") as any;
  const innerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 1,
        color: "black",
        roughness: 0,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        envMapIntensity: 2,
      }),
    []
  );

  useLayoutEffect(() => {
    nodes.glass.geometry.center();
    nodes.glass_back.geometry.center();
    nodes.glass_inner.geometry.center();
  }, [
    nodes.glass.geometry,
    nodes.glass_back.geometry,
    nodes.glass_inner.geometry,
  ]);

  return (
    <group scale={scale} position={position} rotation={rotation}>
      <Caustics
        // Props don't match currently.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        backside={false}
        causticsOnly={false}
        color={[1, 0.8, 0.8]}
        lightSource={[-2, 2.5, -2.5]}
        intensity={0.005}
        worldRadius={0.66 / 10}
        backsideIOR={1.26}
        ior={0.6}
      >
        <mesh
          dispose={null}
          castShadow
          receiveShadow
          geometry={nodes.glass.geometry}
        >
          <MeshTransmissionMaterial
            distortionScale={1}
            forceSinglePass={false}
            temporalDistortion={1}
            thickness={0.2}
            chromaticAberration={0.05}
            anisotropy={1.5}
            clearcoat={1}
            clearcoatRoughness={0.2}
            envMapIntensity={3}
          />
        </mesh>
      </Caustics>

      {/** Some hacks to get some back face reflections, otherwise the glass would look fake */}
      <mesh
        dispose={null}
        scale={[0.95, 1, 0.95]}
        geometry={nodes.glass_back.geometry}
        material={innerMaterial}
      />
      <mesh
        dispose={null}
        geometry={nodes.glass_inner.geometry}
        material={innerMaterial}
      />
    </group>
  );
}
