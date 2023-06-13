/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { Object3D } from "three";

type Helper =
  | "spotLightHelper"
  | "directionalLightHelper"
  | "pointLightHelper"
  | "hemisphereLightHelper";

type HelperInstance = Object3D & { update: () => void; dispose: () => void };

const LIGHT_HELPER_SIZE = 0.2;
const HELPER_EXCLUSIONS = ["directionalLightHelper", "spotLightHelper"];

export const getHelperForElement = (
  name: string
): [Helper, unknown[]] | undefined => {
  switch (name) {
    // Rect area lights helper has been removed from core. For now we just use a standard
    // point light helper - we can investigate adding it at a later date.
    case "rectAreaLight":
    case "pointLight":
    case "ambientLight":
      return ["pointLightHelper", [LIGHT_HELPER_SIZE]];

    case "hemisphereLight":
      return ["hemisphereLightHelper", [LIGHT_HELPER_SIZE]];

    case "spotLight":
      return ["spotLightHelper", []];

    case "directionalLight":
      return ["directionalLightHelper", []];

    default:
      return undefined;
  }
};

export function Helper({
  args = [],
  parentObject,
  helperName: HelperElement,
  onClick,
}: {
  args?: any[];
  parentObject: React.MutableRefObject<Object3D | null>;
  helperName: Helper;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const [target, setTarget] = useState<any | null>(null);
  const helperRef = useRef<HelperInstance>(null!);
  const altHelperRef = useRef<HelperInstance>(null);

  useLayoutEffect(() => {
    if (parentObject && parentObject?.current) {
      setTarget(parentObject.current.children[0]);
    }
  }, [parentObject]);

  useFrame(() => {
    helperRef.current.update();
    altHelperRef.current?.update();
  });

  if (target) {
    return (
      <>
        {HELPER_EXCLUSIONS.includes(HelperElement) && (
          <pointLightHelper
            ref={altHelperRef as any}
            onClick={onClick}
            args={[target, LIGHT_HELPER_SIZE]}
          />
        )}

        <HelperElement
          ref={helperRef as any}
          onClick={
            HELPER_EXCLUSIONS.includes(HelperElement) ? undefined : onClick
          }
          // @ts-expect-error - Hacking, sorry!
          args={[target, ...args]}
        />
      </>
    );
  }

  return null;
}
