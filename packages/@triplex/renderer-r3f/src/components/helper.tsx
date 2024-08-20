/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  createPortal,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { type Mesh, type Object3D } from "three";
import "./camera-helper";
import { usePlayState } from "../stores/state";
import { editorLayer, hiddenLayer } from "../util/layers";

type Helper =
  | "spotLightHelper"
  | "directionalLightHelper"
  | "pointLightHelper"
  | "hemisphereLightHelper"
  | "triplexCameraHelper";

type HelperInstance = Object3D & { dispose: () => void; update: () => void };

const HELPER_SIZE = 0.2;

export const getHelperForElement = (
  name: string,
): [Helper, unknown[]] | undefined => {
  switch (name) {
    // Rect area lights helper has been removed from core. For now we just use a standard
    // point light helper - we can investigate adding it at a later date.
    case "rectAreaLight":
    case "pointLight":
    case "ambientLight":
      return ["pointLightHelper", [HELPER_SIZE]];

    case "hemisphereLight":
      return ["hemisphereLightHelper", [HELPER_SIZE]];

    case "spotLight":
      return ["spotLightHelper", []];

    case "directionalLight":
      return ["directionalLightHelper", []];

    case "perspectiveCamera":
    case "orthographicCamera":
      return ["triplexCameraHelper", []];

    default:
      return undefined;
  }
};

function HelperIcon({
  onClick,
  target,
}: {
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  target: Object3D;
}) {
  const ref = useRef<Mesh>(null!);

  useFrame(() => {
    ref.current.position.copy(target.position);
  });

  return (
    <mesh layers={editorLayer} onClick={onClick} ref={ref} visible={false}>
      <boxGeometry args={[HELPER_SIZE, HELPER_SIZE, HELPER_SIZE]} />
    </mesh>
  );
}

export function Helper({
  args = [],
  helperName: HelperElement,
  onClick,
  targetRef,
}: {
  args?: unknown[];
  helperName: Helper;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  targetRef: React.MutableRefObject<Object3D | null>;
}) {
  const [target, setTarget] = useState<Object3D | null>(null);
  const helperRef = useRef<HelperInstance>(null);
  const scene = useThree((three) => three.scene);
  const state = usePlayState();

  useLayoutEffect(() => {
    if (targetRef && targetRef.current) {
      setTarget(targetRef.current);
    }
  }, [targetRef]);

  useFrame(() => {
    helperRef.current?.update();
  });

  if (target) {
    return (
      <>
        <HelperIcon onClick={onClick} target={target} />
        {createPortal(
          // We portal to helper to be a direct descendent of the scene to prevent
          // position bugs when helpers are logically rendered inside a group.
          // See: https://discourse.threejs.org/t/pointlighthelper-position-problem/47760/2
          <HelperElement
            // @ts-expect-error - Hacking, sorry!
            args={[target, ...args]}
            // Hide this from both the default and the editor raycasters. Helper element
            // bounding boxes aren't generally just what they look visually in the scene
            // so we exclude them altogether and use a hidden box for selection instead.
            // See: HelperIcon component.
            layers={hiddenLayer}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={helperRef as any}
            visible={state !== "play"}
          />,
          scene,
        )}
      </>
    );
  }

  return null;
}
