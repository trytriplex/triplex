/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  createPortal,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { Mesh, Object3D } from "three";
import "./camera-helper";

type Helper =
  | "spotLightHelper"
  | "directionalLightHelper"
  | "pointLightHelper"
  | "hemisphereLightHelper"
  | "triplexCameraHelper";

type HelperInstance = Object3D & { dispose: () => void; update: () => void };

const HELPER_SIZE = 0.2;

export const getHelperForElement = (
  name: string
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
    case "PerspectiveCamera":
    case "OrthographicCamera":
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
    <mesh onClick={onClick} ref={ref} visible={false}>
      <boxGeometry args={[HELPER_SIZE, HELPER_SIZE, HELPER_SIZE]} />
    </mesh>
  );
}

export function Helper({
  args = [],
  helperName: HelperElement,
  onClick,
  parentObject,
}: {
  args?: unknown[];
  helperName: Helper;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  parentObject: React.MutableRefObject<Object3D | null>;
}) {
  const [target, setTarget] = useState<Object3D | null>(null);
  const helperRef = useRef<HelperInstance>(null);
  const scene = useThree((three) => three.scene);

  useLayoutEffect(() => {
    if (parentObject && parentObject?.current) {
      setTarget(parentObject.current.children[0]);
    }
  }, [parentObject]);

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
            // This will be ignored by the selection component when a click event
            // Has been captured. We do this as we don't want the helper to be the
            // Bounding box but instead the helper icon above.
            // @ts-expect-error - Hacking, sorry!
            args={[target, ...args]}
            name="triplex_ignore"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={helperRef as any}
          />,
          scene
        )}
      </>
    );
  }

  return null;
}
