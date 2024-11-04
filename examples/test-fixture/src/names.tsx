/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Box } from "@react-three/drei";

export function Scene() {
  return (
    <group>
      <mesh name="plane1">
        <planeGeometry />
        <meshBasicMaterial color={"#dd8d8d"} visible={true} />
      </mesh>

      <Box name="box1" />
    </group>
  );
}
