/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export default function Nested() {
  return (
    <group position={[1, 0, 3]}>
      <mesh position={[2, 0, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </group>
  );
}

export function ShorthandFragment() {
  return (
    <group>
      <>
        <mesh />
      </>
    </group>
  );
}
