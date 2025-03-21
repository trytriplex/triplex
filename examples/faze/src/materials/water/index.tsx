/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color as Color3, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import frag from "./fragment.glsl";
import vert from "./vertex.glsl";
import { defaultWaves } from "./wave";

export function WaterMaterial({
  opacity = 1.0,
  speed = 1,
  transparent,
  wavelength = 1,
}: {
  /**
   * @min 0
   * @max 1
   */
  opacity?: number;
  /**
   * @min 1
   * @max 5
   */
  speed?: number;
  transparent?: boolean;
  wavelength?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null!);

  useFrame((_, delta) => {
    ref.current.uniforms.u_windTime.value +=
      ref.current.uniforms.u_windSpeed.value * delta;
  });

  const uniforms = useMemo(() => {
    const [waveA, waveB, waveC] = defaultWaves(wavelength);
    return {
      u_highlightColor: { value: new Color3("#b3ffff").convertLinearToSRGB() },
      u_opacity: { value: opacity },
      u_waterColor: { value: new Color3("#1ca3ec").convertLinearToSRGB() },
      u_waveA: { value: waveA },
      u_waveB: { value: waveB },
      u_waveC: { value: waveC },
      u_windSpeed: { value: 0.1 * speed },
      u_windTime: { value: 0.0 },
    };
  }, [opacity, speed, wavelength]);

  return (
    <CustomShaderMaterial
      baseMaterial={MeshStandardMaterial}
      fragmentShader={frag}
      metalness={0.1}
      ref={ref}
      transparent={transparent}
      uniforms={uniforms}
      vertexShader={vert}
    />
  );
}
