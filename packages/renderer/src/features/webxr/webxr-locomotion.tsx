/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useXRControllerLocomotion, XROrigin } from "@react-three/xr";
import { useRef } from "react";
import { type Group } from "three";

export function WebXRLocomotion() {
  const ref = useRef<Group>(null!);

  useXRControllerLocomotion(ref);

  return <XROrigin position={[0, 0, 5]} ref={ref} />;
}
