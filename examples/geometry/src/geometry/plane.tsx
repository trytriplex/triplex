/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { memo } from "react";
import { type Vector3Tuple } from "three";

type Plane = { position?: Vector3Tuple };

const Plane = () => (
  <mesh>
    <planeGeometry />
    <meshStandardMaterial />
  </mesh>
);

export default memo(Plane);
