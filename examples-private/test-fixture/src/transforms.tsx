/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
