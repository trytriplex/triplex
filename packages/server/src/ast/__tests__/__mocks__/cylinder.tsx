/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
function Cylinder({ position }: { position?: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[undefined, 1, 2, 10, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

export default Cylinder;
