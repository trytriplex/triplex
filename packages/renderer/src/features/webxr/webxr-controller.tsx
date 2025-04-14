/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useFrame } from "@react-three/fiber";
import {
  PointerRayModel,
  usePointerXRInputSourceEvents,
  useRayPointer,
  useXRControllerButtonEvent,
  useXRInputSourceEvent,
  useXRInputSourceStateContext,
  XRControllerModel,
  XRSpace,
} from "@react-three/xr";
import { useEvent } from "@triplex/lib";
import { useRef } from "react";
import { Vector3, type Object3D } from "three";
import { useSelectionStore } from "../selection-provider/store";
import { useActionsStore } from "../selection-three-fiber/store";
import { WebXRCursorPoint } from "./webxr-cursor-point";

const originVector = new Vector3();
const directionVector = new Vector3();

export function WebXRController() {
  const controller = useXRInputSourceStateContext("controller");
  const ref = useRef<Object3D>(null);
  const pointRef = useRef<Object3D>(null);
  const pointer = useRayPointer(ref, controller);
  const listeners = useSelectionStore((store) => store.listeners);
  const clearSelection = useSelectionStore((store) => store.clear);
  const selectElement = useSelectionStore((store) => store.select);
  const setHovered = useSelectionStore((store) => store.setHovered);
  const rayMaxLength = 1;
  const cycleTransform = useActionsStore((store) => store.cycleTransform);
  const cycleSpace = useActionsStore((store) => store.cycleSpace);

  const getInputSourceOrientation = useEvent(() => {
    if (!controller.object || !ref.current) {
      return undefined;
    }

    const inputSourceOrigin = controller.object.getWorldPosition(originVector);
    const inputSourceDirection = ref.current
      ?.getWorldDirection(directionVector)
      .negate();

    return {
      inputSourceDirection,
      inputSourceOrigin,
    };
  });

  useXRControllerButtonEvent(controller, "a-button", (e) => {
    if (e === "pressed") {
      cycleTransform();
    }
  });

  useXRControllerButtonEvent(controller, "b-button", (e) => {
    if (e === "pressed") {
      cycleSpace();
    }
  });

  usePointerXRInputSourceEvents(
    pointer,
    controller.inputSource,
    "select",
    controller.events,
  );

  useXRInputSourceEvent(
    controller.inputSource,
    "select",
    () => {
      const orientation = getInputSourceOrientation();
      if (!orientation) {
        return;
      }

      const results = listeners.flatMap((listener) => listener.cb(orientation));

      if (results.length) {
        selectElement(results[0], "replace");
      } else {
        clearSelection();
      }
    },
    [],
  );

  useFrame(() => {
    if (!pointRef.current) {
      return;
    }

    const orientation = getInputSourceOrientation();
    if (!orientation) {
      return;
    }

    const result =
      listeners.flatMap((listener) => listener.cb(orientation)).at(0) ?? null;

    setHovered(result);

    if (result && result.point) {
      pointRef.current.position.copy(result.point);
    } else {
      const delta = orientation.inputSourceDirection
        .normalize()
        .multiplyScalar(rayMaxLength * 4);

      pointRef.current.position.copy(orientation.inputSourceOrigin);
      pointRef.current.position.add(delta);
    }
  });

  return (
    <>
      <XRControllerModel />
      <XRSpace ref={ref} space="target-ray-space">
        <PointerRayModel maxLength={rayMaxLength} pointer={pointer} />
      </XRSpace>
      <WebXRCursorPoint ref={pointRef} />
    </>
  );
}
