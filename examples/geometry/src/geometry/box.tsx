/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Vector3Tuple } from "three";

function Box({
  position,
  rotation,
  scale,
  color,
  size = 1,
}: {
  /**
   * @min 1
   * @max 2
   */
  size?: number;
  position?: Vector3Tuple | number;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple | number;
  color?: "red" | "green" | "blue";
}) {
  const ok = {};
  return (
    <group visible={true} scale={scale}>
      <mesh
        {...ok}
        name="hello-world"
        userData={{ hello: true }}
        onClick={() => {}}
        visible={true}
        position={position}
        rotation={rotation}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial key={color} color={color} />
      </mesh>
    </group>
  );
}

export default Box;
