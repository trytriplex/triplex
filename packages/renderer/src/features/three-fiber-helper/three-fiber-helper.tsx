/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import React, { useCallback, useRef, useState } from "react";
import { type Mesh, type Object3D } from "three";
import { usePlayState } from "../../stores/use-play-state";
import {
  hiddenLayer,
  HOVER_LAYER_INDEX,
  SELECTION_LAYER_INDEX,
} from "../../util/layers";
import "./camera-helper";
import { type ThreeHelper } from "./types";

export type HelperInstance = Object3D & {
  dispose: () => void;
  update: () => void;
};

export const resolveHelper = (
  elementName: string,
  size: number,
): { Element: ThreeHelper; args: unknown[] } | undefined => {
  switch (elementName) {
    // Rect area lights helper has been removed from core. For now we just use a standard
    // point light helper - we can investigate adding it at a later date.
    case "RectAreaLight":
    case "PointLight":
    case "AmbientLight":
      return { Element: "pointLightHelper", args: [size] };

    case "HemisphereLight":
      return { Element: "hemisphereLightHelper", args: [size] };

    case "SpotLight":
      return { Element: "spotLightHelper", args: [] };

    case "DirectionalLight":
      return { Element: "directionalLightHelper", args: [] };

    case "PerspectiveCamera":
    case "OrthographicCamera":
      return { Element: "triplexCameraHelper" as "cameraHelper", args: [] };

    default:
      return undefined;
  }
};

export function ThreeFiberHelper({
  children,
  size = 0.1,
}: {
  children?: React.ReactNode;
  size?: number;
}) {
  const [targetObject, setTargetObject] = useState<Object3D | null>(null);
  const helperRef = useRef<HelperInstance>(null);
  const iconBillboardRef = useRef<Mesh>(null!);
  const scene = useThree((three) => three.scene);
  const state = usePlayState();
  const helper = targetObject && resolveHelper(targetObject.type, size);

  const captureParentSceneObject = useCallback((ref: Object3D | null) => {
    setTargetObject(ref ? ref.parent : null);
  }, []);

  useFrame(() => {
    if (!helperRef.current || !targetObject) {
      return;
    }

    if (targetObject.layers.isEnabled(SELECTION_LAYER_INDEX)) {
      helperRef.current.layers.enable(SELECTION_LAYER_INDEX);
    } else {
      helperRef.current.layers.disable(SELECTION_LAYER_INDEX);
    }

    if (targetObject.layers.isEnabled(HOVER_LAYER_INDEX)) {
      helperRef.current.layers.enable(HOVER_LAYER_INDEX);
    } else {
      helperRef.current.layers.disable(HOVER_LAYER_INDEX);
    }

    helperRef.current.update();
    iconBillboardRef.current.position.copy(targetObject.position);
  });

  return (
    <>
      <group ref={captureParentSceneObject} />
      {helper &&
        createPortal(
          <>
            <mesh name="forced_visible" ref={iconBillboardRef} visible={false}>
              <boxGeometry args={[size * 2, size * 2, size * 2]} />
              {children}
            </mesh>
            <helper.Element
              // @ts-expect-error - Hacking, sorry!
              args={[targetObject, ...helper.args]}
              // Hide this from both the default and the editor raycasters. Helper element
              // bounding boxes aren't generally just what they look visually in the scene
              // so we exclude them altogether and use a hidden box for selection instead.
              layers={hiddenLayer}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref={helperRef as any}
              visible={state !== "play"}
            />
          </>,
          scene,
        )}
    </>
  );
}
