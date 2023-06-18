import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { Mesh, Object3D } from "three";
import "./camera-helper";

type Helper =
  | "spotLightHelper"
  | "directionalLightHelper"
  | "pointLightHelper"
  | "hemisphereLightHelper"
  | "triplexCameraHelper";

type HelperInstance = Object3D & { update: () => void; dispose: () => void };

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
  target,
  onClick,
}: {
  target: Object3D;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const ref = useRef<Mesh>(null!);

  useFrame(() => {
    ref.current.position.copy(target.position);
  });

  return (
    <mesh onClick={onClick} ref={ref}>
      <boxGeometry args={[HELPER_SIZE, HELPER_SIZE, HELPER_SIZE]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function Helper({
  args = [],
  parentObject,
  helperName: HelperElement,
  onClick,
}: {
  args?: unknown[];
  parentObject: React.MutableRefObject<Object3D | null>;
  helperName: Helper;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const [target, setTarget] = useState<Object3D | null>(null);
  const helperRef = useRef<HelperInstance>(null);

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
        <HelperIcon target={target} onClick={onClick} />
        <HelperElement
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={helperRef as any}
          // @ts-expect-error - Hacking, sorry!
          args={[target, ...args]}
        />
      </>
    );
  }

  return null;
}
