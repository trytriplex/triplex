/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { Spherical, Vector3 } from "three";
import { buildSceneSphere } from "../../util/scene";
import { useCamera } from "./context";

let previousResetKey: string | undefined | null = null;

export function FitCameraToScene({
  children,
  resetKeys,
}: {
  children: React.ReactNode;
  resetKeys?: string[];
}) {
  const { controls } = useCamera();
  const scene = useThree((store) => store.scene);
  const resetKey = resetKeys?.join("");

  useLayoutEffect(() => {
    if (!controls.current || resetKey === previousResetKey) {
      return;
    }

    const sphere = buildSceneSphere(scene);
    if (sphere.isEmpty()) {
      return;
    }

    const point = new Spherical().setFromVector3(
      // Z forward rotation.
      new Vector3(0, 0, 1),
    );
    controls.current.rotateTo(point.theta, point.phi, false);
    controls.current.fitToSphere(sphere, false);

    // Store the reset key to prevent the camera resetting if the scene re-mounts.
    // Currently this only happens if the root provider component declared by users changes.
    previousResetKey = resetKey;
  }, [controls, scene, resetKey]);

  return <>{children}</>;
}
