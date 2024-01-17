/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Vector3Tuple } from "three";

function Box({
  color = "blue",
  position,
  rotation,
  scale,
  size = 1,
}: {
  color?: "red" | "green" | "blue";
  position?: Vector3Tuple | number;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple | number;
  /**
   * @min 1
   * @max 2
   * @step 0.1
   */
  size?: number;
}) {
  const ok = {};
  return (
    <group scale={scale} visible={true}>
      <mesh
        {...ok}
        name="hello-world"
        onClick={() => {}}
        position={position}
        rotation={rotation}
        userData={{ hello: true }}
        visible={true}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} key={color} />
      </mesh>
    </group>
  );
}

export default Box;
