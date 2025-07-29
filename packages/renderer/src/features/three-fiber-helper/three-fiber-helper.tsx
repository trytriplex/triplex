/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import React, { useCallback, useRef, useState, type JSX } from "react";
import { type Mesh, type Object3D } from "three";
import { usePlayState } from "../../stores/use-play-state";
import {
  hiddenLayer,
  HOVER_LAYER_INDEX,
  SELECTION_LAYER_INDEX,
} from "../../util/layers";
import { type SupportedElements, type ThreeHelper } from "./types";
import { XROriginHelper } from "./xr-origin-helper";

export type HelperInstance = Object3D & {
  dispose: () => void;
  update: () => void;
};

export const resolveHelper = (
  elementName: SupportedElements,
  size: number,
):
  | { Element: ThreeHelper; args: unknown[]; type: "inbuilt" }
  | { jsx: JSX.Element; type: "custom" } => {
  switch (elementName) {
    // Rect area lights helper has been removed from core. For now we just use a standard
    // point light helper - we can investigate adding it at a later date.
    case "rectAreaLight":
    case "pointLight":
    case "ambientLight":
      return { Element: "pointLightHelper", args: [size], type: "inbuilt" };

    case "hemisphereLight":
      return {
        Element: "hemisphereLightHelper",
        args: [size],
        type: "inbuilt",
      };

    case "spotLight":
      return { Element: "spotLightHelper", args: [], type: "inbuilt" };

    case "directionalLight":
      return { Element: "directionalLightHelper", args: [], type: "inbuilt" };

    case "perspectiveCamera":
    case "orthographicCamera":
      return { Element: "cameraHelper", args: [], type: "inbuilt" };

    case "XROrigin":
      return {
        jsx: <XROriginHelper color="rgb(255,255,0)" />,
        type: "custom",
      };

    default:
      throw new Error("invariant: unexpected helper type");
  }
};

export function ThreeFiberHelper({
  children,
  helper,
  size = 0.1,
}: {
  children?: React.ReactNode;
  helper: SupportedElements;
  size?: number;
}) {
  const [targetObject, setTargetObject] = useState<Object3D | null>(null);
  const helperRef = useRef<HelperInstance>(null);
  const interactiveRef = useRef<Mesh>(null);
  const scene = useThree((three) => three.scene);
  const state = usePlayState();
  const resolvedHelper = resolveHelper(helper, size);

  const captureParentSceneObject = useCallback((ref: Object3D | null) => {
    const object = ref ? ref.parent : null;

    if (object && interactiveRef.current) {
      interactiveRef.current.position.copy(object.position);
    }

    setTargetObject(object);
  }, []);

  useFrame(() => {
    if (!helperRef.current || !targetObject || !interactiveRef.current) {
      return;
    }

    if (targetObject.layers.isEnabled(SELECTION_LAYER_INDEX)) {
      helperRef.current.traverse((child) =>
        child.layers.enable(SELECTION_LAYER_INDEX),
      );
    } else {
      helperRef.current.traverse((child) =>
        child.layers.disable(SELECTION_LAYER_INDEX),
      );
    }

    if (targetObject.layers.isEnabled(HOVER_LAYER_INDEX)) {
      helperRef.current.traverse((child) =>
        child.layers.enable(HOVER_LAYER_INDEX),
      );
    } else {
      helperRef.current.traverse((child) =>
        child.layers.disable(HOVER_LAYER_INDEX),
      );
    }

    if (resolvedHelper.type === "inbuilt") {
      helperRef.current.update();
    }

    if (resolvedHelper.type === "custom") {
      helperRef.current.position.copy(targetObject.position);
      helperRef.current.rotation.copy(targetObject.rotation);
      helperRef.current.scale.copy(targetObject.scale);
    }

    interactiveRef.current.position.copy(targetObject.position);
  });

  return (
    <>
      {createPortal(
        <>
          <mesh name="forced_visible" ref={interactiveRef} visible={false}>
            <boxGeometry args={[size * 2, size * 2, size * 2]} />
            {children}
          </mesh>
          {resolvedHelper.type === "inbuilt" && targetObject && (
            <resolvedHelper.Element
              // @ts-expect-error - Hacking, sorry!
              args={[targetObject, ...resolvedHelper.args]}
              // Hide this from both the default and the editor raycasters. Helper element
              // bounding boxes aren't generally just what they look visually in the scene
              // so we exclude them altogether and use a hidden box for selection instead.
              layers={hiddenLayer}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref={helperRef as any}
              visible={state !== "play"}
            />
          )}
          {resolvedHelper.type === "custom" && (
            <group
              layers={hiddenLayer}
              ref={helperRef}
              visible={state !== "play"}
            >
              {resolvedHelper.jsx}
            </group>
          )}
        </>,
        scene,
      )}
      <group ref={captureParentSceneObject} />
    </>
  );
}
