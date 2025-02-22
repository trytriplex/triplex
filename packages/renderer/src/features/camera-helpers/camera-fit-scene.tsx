/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { useContext, useLayoutEffect } from "react";
import { Spherical, Vector3 } from "three";
import { buildSceneSphere } from "../../util/three";
import { CameraControlsContext } from "../camera-new/context";

export function FitCameraToScene({ resetKeys }: { resetKeys?: string[] }) {
  const controls = useContext(CameraControlsContext);
  const scene = useThree((store) => store.scene);
  const resetKey = resetKeys?.join("");

  useLayoutEffect(() => {
    if (!controls) {
      return;
    }

    const sphere = buildSceneSphere(scene);
    if (
      sphere.isEmpty() ||
      /**
       * There are edge cases where a scene can return NaN for its radius. One
       * example is the uikit example in test-fixtures doing this on initial
       * load. To prevent the camera from getting into invalid states we check
       * this and abort early.
       */
      Number.isNaN(sphere.radius)
    ) {
      return;
    }

    const point = new Spherical().setFromVector3(
      // Z forward rotation.
      new Vector3(0, 0, 1),
    );
    controls.rotateTo(point.theta, point.phi, false);
    controls.fitToSphere(sphere, false);
  }, [controls, scene, resetKey]);

  return null;
}
