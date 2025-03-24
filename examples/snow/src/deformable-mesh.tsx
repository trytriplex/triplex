/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  MathUtils,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshStandardMaterial,
  RedFormat,
  type Mesh,
  type Vector2,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { DeformableMeshControl } from "./deformable-mesh-control";
import { drawCircle } from "./geometry";
import fragmentShader from "./snow.frag";
import vertexShader from "./snow.vert";

export function DeformableMesh({
  height = 2,
  maxDepth = 0.3,
  resolution = 64,
  width = 2,
}: {
  height?: number;
  maxDepth?: number;
  resolution?: number;
  width?: number;
}) {
  const ref = useRef<Mesh>(null);
  const [textureSource] = useState(
    () => new Uint8Array(resolution * resolution),
  );
  const depthTexture = useMemo(() => {
    const dt = new DataTexture(
      textureSource,
      resolution,
      resolution,
      RedFormat,
    );
    dt.magFilter = LinearFilter;
    dt.needsUpdate = true;
    return dt;
  }, [textureSource, resolution]);
  const lastIndex = useRef<Vector2 | null>(null);

  const onIntersect = useCallback(
    (
      ...args:
        | [undefined]
        | [uv: Vector2, radius: number, coverage: number, depth: number]
    ) => {
      if (!args[0]) {
        lastIndex.current = null;
        return;
      }

      const [to, radius, coverage, depth] = args;
      const from = lastIndex.current ?? to;

      let time = from.equals(to) ? 1 : 0;

      do {
        from.lerp(to, time);

        drawCircle(
          textureSource,
          from.x,
          from.y,
          resolution,
          depth,
          maxDepth,
          radius,
          coverage,
        );

        time += 0.1;
      } while (time < 1);

      lastIndex.current = to;
      depthTexture.needsUpdate = true;
    },
    [maxDepth, resolution, depthTexture, textureSource],
  );

  const uniforms = useMemo(
    () => ({
      u_depthTexture: { value: depthTexture },
      u_maxDepth: { value: maxDepth },
      u_resolution: { value: resolution },
    }),
    [depthTexture, maxDepth, resolution],
  );

  return (
    <>
      <mesh
        castShadow
        name="target"
        position={[0, 0.02, 0]}
        receiveShadow
        ref={ref}
        rotation={[MathUtils.degToRad(-90), 0, 0]}
      >
        <planeGeometry
          args={[width, height, width * resolution, height * resolution]}
        />
        <CustomShaderMaterial
          baseMaterial={MeshStandardMaterial}
          fragmentShader={fragmentShader}
          side={DoubleSide}
          uniforms={uniforms}
          vertexShader={vertexShader}
        />
        <CustomShaderMaterial
          attach="customDistanceMaterial"
          baseMaterial={MeshDistanceMaterial}
          uniforms={uniforms}
          vertexShader={vertexShader}
        />
        <CustomShaderMaterial
          attach="customDepthMaterial"
          baseMaterial={MeshDepthMaterial}
          uniforms={uniforms}
          vertexShader={vertexShader}
        />
      </mesh>

      <pointLight
        castShadow
        intensity={2}
        position={[1.76, 0.96, 0.44]}
        shadow-bias={-0.0001}
      />
      <pointLight
        castShadow
        intensity={2}
        position={[-0.8, 1.24, -0.78]}
        shadow-bias={-0.0001}
      />
      <pointLight
        castShadow
        intensity={2}
        position={[0, 0.68, 1.16]}
        shadow-bias={-0.0001}
        shadow-mapSize-height={2096}
        shadow-mapSize-width={2096}
      />
      <DeformableMeshControl
        meshRef={ref}
        onIntersect={onIntersect}
        position={[0, 0, 0]}
      />
      <ambientLight intensity={0.5} position={[0, 1.14, 0]} />
    </>
  );
}
