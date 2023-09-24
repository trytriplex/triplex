/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { RigidBody } from "@react-three/rapier";

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
    </RigidBody>
  );
}
