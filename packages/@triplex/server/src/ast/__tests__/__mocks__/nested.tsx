/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
