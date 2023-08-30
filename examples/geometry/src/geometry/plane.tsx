/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { memo } from "react";
import { Vector3Tuple } from "three";

type Plane = { position?: Vector3Tuple };

const Plane = () => (
  <mesh>
    <planeGeometry />
    <meshStandardMaterial />
  </mesh>
);

export default memo(Plane);
