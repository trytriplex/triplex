/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useXRControllerLocomotion, XROrigin } from "@react-three/xr";
import { useEvent } from "@triplex/lib";
import { useRef, type ReactNode } from "react";
import { type Group } from "three";
import { WebXRGetOriginContext } from "./context";

export function WebXRLocomotion({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null!);
  const getOrigin = useEvent(() => {
    return ref.current.position;
  });

  useXRControllerLocomotion(ref);

  return (
    <WebXRGetOriginContext value={getOrigin}>
      <XROrigin position={[0, 0, 5]} ref={ref} />
      {children}
    </WebXRGetOriginContext>
  );
}
