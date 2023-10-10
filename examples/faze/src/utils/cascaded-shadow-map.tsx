/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import {
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
  Vector3Tuple,
} from "three";
import CSM, { CSMParams } from "three-csm";

interface CascadedShadowMapProps
  extends Omit<CSMParams, "lightDirection" | "camera" | "parent"> {
  fade?: boolean;
  lightDirection?: Vector3Tuple;
}

class CSMProxy {
  instance: CSM | undefined;
  args: CSMParams;

  constructor(args: CSMParams) {
    this.args = args;
  }

  set fade(fade: boolean) {
    if (this.instance) {
      this.instance.fade = fade;
    }
  }

  set camera(camera: PerspectiveCamera | OrthographicCamera) {
    if (this.instance) {
      this.instance.camera = camera;
    }
  }

  set lightDirection(vector: Vector3 | Vector3Tuple) {
    if (this.instance) {
      this.instance.lightDirection = Array.isArray(vector)
        ? new Vector3().fromArray(vector).normalize()
        : vector;
    }
  }

  attach() {
    this.instance = new CSM(this.args);
  }

  dispose() {
    if (this.instance) {
      this.instance.dispose();
    }
  }
}

export function CascadedShadowMap({
  cascades = 2,
  customSplitsCallback,
  fade,
  lightDirection = [1, -1, 1],
  lightFar,
  lightIntensity = 0.25,
  lightMargin,
  lightNear,
  maxFar = 50,
  mode,
  shadowBias = 0.000_001,
  shadowMapSize = 1024,
}: CascadedShadowMapProps) {
  const camera = useThree((three) => three.camera);
  const parent = useThree((three) => three.scene);
  const proxyInstance = useMemo(
    () =>
      new CSMProxy({
        camera,
        cascades,
        customSplitsCallback,
        lightDirection: new Vector3().fromArray(lightDirection).normalize(),
        lightFar,
        lightIntensity,
        lightMargin,
        lightNear,
        maxFar,
        mode,
        parent,
        shadowBias,
        shadowMapSize,
      }),
    // These values will cause CSM to re-instantiate itself.
    // This is an expensive operation and should be avoided.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Values that can be updated during runtime are omitted from this deps check.
      cascades,
      customSplitsCallback,
      fade,
      lightFar,
      lightIntensity,
      lightMargin,
      lightNear,
      maxFar,
      mode,
      shadowBias,
      shadowMapSize,
    ]
  );

  useFrame(() => {
    if (proxyInstance && proxyInstance.instance) {
      proxyInstance.instance.update();
    }
  });

  useLayoutEffect(() => {
    proxyInstance.attach();

    return () => {
      proxyInstance.dispose();
    };
  }, [proxyInstance]);

  return (
    <primitive
      camera={camera}
      fade={fade}
      lightDirection={lightDirection}
      object={proxyInstance}
    />
  );
}
