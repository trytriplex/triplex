/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createPortal, useThree } from "@react-three/fiber";
import { useXRInputSourceStateContext } from "@react-three/xr";
import { forwardRef, useEffect } from "react";
import { type Object3D } from "three";
import { useSelectionStore } from "../selection-provider/store";
import frag from "./webxr-cursor-point.frag";
import vert from "./webxr-cursor-point.vert";

export const WebXRCursorPoint = forwardRef<Object3D>((_, ref) => {
  const scene = useThree((store) => store.scene);
  const controller = useXRInputSourceStateContext("controller");
  const hovered = useSelectionStore((store) => store.hovered);
  const selections = useSelectionStore((store) => store.selections);

  useEffect(() => {
    if (hovered) {
      controller.inputSource.gamepad?.hapticActuators[0]?.pulse(0.15, 1);
    }
  }, [controller, hovered]);

  useEffect(() => {
    if (selections.length) {
      controller.inputSource.gamepad?.hapticActuators[0]?.pulse(0.8, 20);
    }
  }, [controller, selections]);

  return createPortal(
    <mesh ref={ref}>
      <sphereGeometry />
      <shaderMaterial
        depthTest={false}
        fragmentShader={frag}
        transparent
        uniforms={{ size: { value: 100 } }}
        vertexShader={vert}
      />
    </mesh>,
    scene,
  );
});

WebXRCursorPoint.displayName = "WebXRCursorPoint";
