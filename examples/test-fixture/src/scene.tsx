/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera } from "@react-three/drei";
import Box from "./geometry/box";

export default function Scene() {
  return (
    <>
      <Box />
      <PerspectiveCamera
        position={[-1.831_592_557_014_578_1, 0.943_661_973_904_340_8, 0]}
        rotation={[
          -1.570_796_326_794_896_6, -1.221_730_476_396_030_6,
          -1.570_796_326_794_896_6,
        ]}
      />
    </>
  );
}
