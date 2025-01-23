/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { applyStepModifiers, useEvent, useStepModifiers } from "@triplex/lib";
import { useEffect, useRef, useState } from "react";
import { MathUtils, type Object3D } from "three";
import {
  TransformControls as TransformControlsImpl,
  type TransformControlsProps,
} from "triplex-drei";
import { Tunnel } from "../../components/tunnel";
import { useCamera } from "../camera/context";

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
  object: Object3D | undefined;
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
      if (controls) {
        // eslint-disable-next-line react-compiler/react-compiler
        controls.enabled = !event.value;
      }
    };

    const transformControls = controlsRef.current;

    transformControls.addEventListener("dragging-changed", callback);

    return () => {
      transformControls.removeEventListener("dragging-changed", callback);
    };
  }, [controls]);

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
    <>
      {import.meta.env.VITE_TRIPLEX_ENV === "test" && enabled && (
        <Tunnel.In>
          <button
            onMouseUp={(e) => {
              e.stopPropagation();
              object?.position.set(1, 1, 1);
              onCompleteTransform?.();
            }}
            style={{ left: 0, position: "absolute", top: "50%", zIndex: 999 }}
          >
            Test Translation
          </button>
        </Tunnel.In>
      )}

      <TransformControlsImpl
        camera={camera || undefined}
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
    </>
  );
}
