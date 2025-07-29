/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { send } from "@triplex/bridge/client";
import { useContext } from "react";
import { Vector3, type Object3D } from "three";
import { type CameraControls } from "triplex-drei";
import { fitCameraToObjects } from "../../util/three";
import {
  ActiveCameraContext,
  CameraControlsContext,
} from "../camera-new/context";
import { AxisHelper } from "./axis-helper";
import { GizmoHelper } from "./gizmo-helper";

const tweenCamera = (
  controls: CameraControls,
  scene: Object3D,
  position: Vector3,
) => {
  fitCameraToObjects(
    scene.children,
    controls,
    new Vector3(position.x, position.y, position.z),
    true,
  );
};

export function CameraAxisHelper() {
  const camera = useContext(ActiveCameraContext);
  const controls = useContext(CameraControlsContext);
  const scene = useThree((store) => store.scene);

  if (!camera || camera.type === "default") {
    return null;
  }

  return (
    <GizmoHelper alignment="bottom-center" margin={[60, 60]} renderPriority={2}>
      <AxisHelper
        onClick={(e) => {
          if (!controls) {
            return;
          }

          if (
            e.eventObject.position.x === 0 &&
            e.eventObject.position.y === 0 &&
            e.eventObject.position.z === 0
          ) {
            tweenCamera(controls, scene, e.face!.normal);
          } else {
            tweenCamera(controls, scene, e.eventObject.position);
          }

          send("track", { actionId: "controls_axishelper" });
        }}
        scale={33}
      />
    </GizmoHelper>
  );
}
