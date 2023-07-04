/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color as Color3, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { defaultWaves } from "./wave";
import vert from "./vertex.glsl";
import frag from "./fragment.glsl";

export function WaterMaterial({
  opacity = 1.0,
  transparent,
  wavelength = 1,
  speed = 1,
}: {
  /**
   * @min 0
   * @max 1
   */
  opacity?: number;
  transparent?: boolean;
  wavelength?: number;
  /**
   * @min 1
   * @max 5
   */
  speed?: number;
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
      u_windSpeed: { value: 0.1 * speed },
      u_windTime: { value: 0.0 },
      u_waveA: { value: waveA },
      u_waveB: { value: waveB },
      u_waveC: { value: waveC },
      u_opacity: { value: opacity },
      u_waterColor: { value: new Color3("#1ca3ec").convertLinearToSRGB() },
      u_highlightColor: { value: new Color3("#b3ffff").convertLinearToSRGB() },
    };
  }, [opacity, speed, wavelength]);

  return (
    <CustomShaderMaterial
      baseMaterial={MeshStandardMaterial}
      fragmentShader={frag}
      ref={ref}
      metalness={0.1}
      transparent={transparent}
      uniforms={uniforms}
      vertexShader={vert}
    />
  );
}
