/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Box from "./geometry/box";
import Cylinder from "./geometry/cylinder";
import Sphere from "./geometry/sphere";

export default function Scene() {
  return (
    <>
      <Box color="red" />
      <Cylinder position={[-1.86, 0, -1.84]} />
      <Sphere position={[2.02, 0, -1.8]} />
      <ambientLight intensity={0.4} />
      <pointLight intensity={10.38} position={[-1.44, 2.54, 0]} />
    </>
  );
}
