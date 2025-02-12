/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
