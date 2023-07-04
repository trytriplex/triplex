/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export default function Cylinder({
  position,
}: {
  position?: [number, number, number];
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color="#eac7c7" />
    </mesh>
  );
}
