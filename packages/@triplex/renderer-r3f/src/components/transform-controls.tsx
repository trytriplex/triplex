/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { applyStepModifiers, useEvent, useStepModifiers } from "@triplex/lib";
import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import {
  TransformControls as TransformControlsImpl,
  type TransformControlsProps,
} from "triplex-drei";
import { useCamera } from "./camera";

const steps = {
  rotate: {
    ctrl: MathUtils.degToRad(10),
    default: Math.PI / 180,
  },
  scale: { ctrl: 0.1, default: 0.01 },
  translate: { ctrl: 1, default: 0.01 },
};

export function TransformControls({
  enabled,
  mode,
  object,
  onCompleteTransform,
  space,
}: {
  enabled?: boolean;
  mode: TransformControlsProps["mode"];
  object: TransformControlsProps["object"];
  onCompleteTransform?: () => void;
  space?: TransformControlsProps["space"];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera, controls } = useCamera();
  const modifiers = useStepModifiers({ isDisabled: !enabled });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const callback = (event: { value: boolean }) => {
      if (controls.current) {
        // eslint-disable-next-line react-compiler/react-compiler
        controls.current.enabled = !event.value;
      }
    };

    const transformControls = controlsRef.current;

    transformControls.addEventListener("dragging-changed", callback);

    return () => {
      transformControls.removeEventListener("dragging-changed", callback);
    };
    // When the camera changes the ref of transform controls is re-created
    // So we need to flush this effect to add the events back.
  }, [camera, controls]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (isDragging && e.key === "Escape") {
        // TODO: Pressing escape should revert back to the original position/rotation/scale.
        // Right now we just block being able to de-select the current selection.
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [isDragging]);

  const onMouseDownHandler = useEvent(() => {
    setIsDragging(true);
  });

  const onMouseUpHandler = useEvent(() => {
    setIsDragging(false);
    onCompleteTransform?.();
  });

  return (
    <TransformControlsImpl
      camera={camera}
      enabled={enabled}
      mode={mode}
      object={object}
      onMouseDown={onMouseDownHandler}
      onMouseUp={onMouseUpHandler}
      ref={controlsRef}
      rotationSnap={applyStepModifiers(steps.rotate, modifiers)}
      scaleSnap={applyStepModifiers(steps.scale, modifiers)}
      space={space}
      translationSnap={applyStepModifiers(steps.translate, modifiers)}
    />
  );
}
