/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Vector3Tuple } from "three";

export function ThisSpreadProps(props: { position: Vector3Tuple }) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh>
        <cylinderGeometry
          args={[undefined, undefined, 2, undefined, undefined, false]}
        />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
}
