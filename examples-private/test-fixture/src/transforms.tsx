/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Vector3Tuple } from "three";

export function TranslateCustomComponent() {
  return <Transformable />;
}

export function Transformable({
  position,
  rotation,
}: {
  position?: [x: number, y: number, z: number];
  rotation?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}
