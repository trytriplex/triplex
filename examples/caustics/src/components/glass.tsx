/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Caustics, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import {
  AdditiveBlending,
  FrontSide,
  MeshStandardMaterial,
  Vector3Tuple,
} from "three";

export function Glass({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = useGLTF("/glass-transformed.glb") as any;
  const innerMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        blending: AdditiveBlending,
        color: "black",
        envMapIntensity: 2,
        opacity: 1,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        roughness: 0,
        side: FrontSide,
        transparent: true,
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
    <group position={position} rotation={rotation} scale={scale}>
      <Caustics
        // Props don't match currently.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        backside={false}
        backsideIOR={1.26}
        causticsOnly={false}
        color={[1, 0.8, 0.8]}
        intensity={0.005}
        ior={0.6}
        lightSource={[-2, 2.5, -2.5]}
        worldRadius={0.66 / 10}
      >
        <mesh
          castShadow
          dispose={null}
          geometry={nodes.glass.geometry}
          receiveShadow
        >
          <MeshTransmissionMaterial
            anisotropy={1.5}
            chromaticAberration={0.05}
            clearcoat={1}
            clearcoatRoughness={0.2}
            distortionScale={1}
            envMapIntensity={3}
            forceSinglePass={false}
            temporalDistortion={1}
            thickness={0.2}
          />
        </mesh>
      </Caustics>

      {/**
       * Some hacks to get some back face reflections, otherwise the glass would look
       * fake
       */}
      <mesh
        dispose={null}
        geometry={nodes.glass_back.geometry}
        material={innerMaterial}
        scale={[0.95, 1, 0.95]}
      />
      <mesh
        dispose={null}
        geometry={nodes.glass_inner.geometry}
        material={innerMaterial}
      />
    </group>
  );
}
