/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Float } from "@react-three/drei";

export function Sphere({
  color = "hotpink",
  floatIntensity = 0,
  position,
  scale,
  speed = 0,
}: {
  color?: string;
  enabled?: boolean;
  floatIntensity?: number;
  position?: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  return (
    <Float floatIntensity={floatIntensity} speed={speed}>
      <mesh castShadow position={position} scale={scale}>
        <sphereGeometry />
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  );
}
