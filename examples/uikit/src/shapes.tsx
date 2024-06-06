/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
      <mesh position={position}>
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
      <mesh position={position} rotation={rotation}>
        <sphereGeometry args={[size, 30, 30, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
}

export function Ring() {
  return (
    <Float>
      <mesh position={[-1.2, 1.4, 0]}>
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
