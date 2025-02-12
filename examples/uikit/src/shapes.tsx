/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Float } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Circle({
  color,
  position,
  size,
}: {
  color?: string;
  position?: Vector3Tuple;
  size?: number;
}) {
  return (
    <Float>
      <mesh castShadow position={position} receiveShadow>
        <sphereGeometry args={[size, 30, 30]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
}

export function SemiCircle({
  color,
  position,
  rotation,
  size,
}: {
  color?: string;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  size?: number;
}) {
  return (
    <Float>
      <mesh castShadow position={position} receiveShadow rotation={rotation}>
        <sphereGeometry args={[size, 30, 30, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
}

export function Ring() {
  return (
    <Float>
      <mesh castShadow position={[-1.2, 1.4, 0]} receiveShadow>
        <ringGeometry args={[1.27, 1.3, 60]} />
        <meshStandardMaterial
          color="#5e4a9b"
          emissive="#fff"
          emissiveIntensity={0.05}
        />
      </mesh>
    </Float>
  );
}
