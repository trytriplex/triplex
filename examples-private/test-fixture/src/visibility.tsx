/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function InvisibleMesh() {
  return (
    <>
      <mesh name={"visible"} position={[0, 0, -1.2]} scale={[3.66, 3.04, 1]}>
        <boxGeometry />
      </mesh>
      <mesh name={"invisible"} visible={false}>
        <boxGeometry />
      </mesh>
    </>
  );
}

export function InvisibleParent() {
  return (
    <>
      <mesh name={"visible"} position={[0, 0, -1.2]} scale={[3.66, 3.04, 1]}>
        <boxGeometry />
      </mesh>
      <group visible={false}>
        <mesh name={"invisible"}>
          <boxGeometry />
        </mesh>
      </group>
    </>
  );
}
