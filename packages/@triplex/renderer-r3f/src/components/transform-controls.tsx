/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { forwardRef, useEffect, useRef } from "react";
import mergeRefs from "react-merge-refs";
import {
  TransformControls as TransformControlsImpl,
  type TransformControlsProps,
} from "triplex-drei";
import { useCamera } from "./camera";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TransformControls = forwardRef<any, TransformControlsProps>(
  ({ enabled, ...props }: TransformControlsProps, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controlsRef = useRef<any>(null);
    const { camera, controls } = useCamera();

    useEffect(() => {
      const callback = (event: { value: boolean }) => {
        if (controls.current) {
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

    return (
      <TransformControlsImpl
        {...props}
        camera={camera}
        enabled={enabled}
        ref={mergeRefs([controlsRef, ref])}
      />
    );
  }
);

TransformControls.displayName = "TransformControls";
