/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Box({
  position,
  rotation,
  scale,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [x: number, y: number, z: number] | number;
}) {
  return (
    <RigidBody>
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <CuboidCollider args={[1.92, 0.14, 1.32]} />
    </RigidBody>
  );
}
