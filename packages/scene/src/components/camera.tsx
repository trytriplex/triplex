/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { listen, send } from "@triplex/bridge/client";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Layers, Vector3, Vector3Tuple } from "three";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "triplex-drei";

function frustumHeightAtDistance(
  camera: THREE.PerspectiveCamera,
  distance: number
) {
  const vFov = (camera.fov * Math.PI) / 180;
  return Math.tan(vFov / 2) * distance * 2;
}

function frustumWidthAtDistance(
  camera: THREE.PerspectiveCamera,
  distance: number
) {
  return frustumHeightAtDistance(camera, distance) * camera.aspect;
}

const V1 = new Vector3();

interface CameraContextType {
  controls: React.MutableRefObject<{ enabled: boolean } | null>;
  setCamera: (
    camera: THREE.OrthographicCamera | THREE.PerspectiveCamera,
    data: { column: number; line: number; path: string }
  ) => void;
}

const CameraContext = createContext<CameraContextType>({
  controls: { current: null },
  setCamera: () => {},
});

export const useCamera = () => {
  const context = useContext(CameraContext);
  return context;
};

export function Camera({
  children,
  layers,
  position,
  target,
}: {
  children?: React.ReactNode;
  layers?: Layers;
  position: Vector3Tuple;
  target: Vector3Tuple;
}) {
  // This is the source of truth for what camera is active.
  // When this is set it propagates to the editor frame in the effect.
  const [type, setType] = useState<"perspective" | "orthographic" | "user">(
    "perspective"
  );
  const prevType = useRef<"perspective" | "orthographic">();
  const orthographicRef = useRef<THREE.OrthographicCamera>(null!);
  const perspectiveRef = useRef<THREE.PerspectiveCamera>(null!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [activeCamera, setActiveCamera] = useState<
    THREE.OrthographicCamera | THREE.PerspectiveCamera | undefined
  >(undefined);
  const isTriplexCamera =
    activeCamera && activeCamera.name === "__triplex_camera";

  useEffect(() => {
    return listen("trplx:requestCameraTypeChange", ({ type }) => {
      setType(type);
    });
  });

  useLayoutEffect(() => {
    if (type === "orthographic") {
      const vtarget = V1.fromArray(target);
      orthographicRef.current.position.copy(perspectiveRef.current.position);
      const distance = perspectiveRef.current.position.distanceTo(vtarget);
      const halfWidth =
        frustumWidthAtDistance(perspectiveRef.current, distance) / 2;
      const halfHeight =
        frustumHeightAtDistance(perspectiveRef.current, distance) / 2;

      orthographicRef.current.top = halfHeight;
      orthographicRef.current.bottom = -halfHeight;
      orthographicRef.current.left = -halfWidth;
      orthographicRef.current.right = halfWidth;
      orthographicRef.current.zoom = 1;
      orthographicRef.current.lookAt(vtarget);
      orthographicRef.current.updateProjectionMatrix();

      send("trplx:onCameraTypeChange", { type });

      prevType.current = "orthographic";
      setActiveCamera(orthographicRef.current);
    } else if (type === "perspective") {
      if (prevType.current === "orthographic") {
        const oldY = perspectiveRef.current.position.y;
        perspectiveRef.current.position.copy(orthographicRef.current.position);
        perspectiveRef.current.position.y = oldY / orthographicRef.current.zoom;
        perspectiveRef.current.updateProjectionMatrix();
      }

      send("trplx:onCameraTypeChange", { type });

      prevType.current = "perspective";
      setActiveCamera(perspectiveRef.current);
    }
  }, [target, type]);

  useFrame((state) => {
    if (activeCamera) {
      // Force the Triplex active camera to be the active camera.
      // We sidestep the R3F state management here because we want to be able to
      // control which camera is active (userland vs. Triplex).
      state.camera = activeCamera;
    }
  });

  const context: CameraContextType = useMemo(
    () => ({
      controls: controlsRef,
      setCamera: (camera, data) => {
        send("trplx:onStateChange", { change: "userCamera", data });
        setActiveCamera(camera);
        setType("user");
      },
    }),
    []
  );

  return (
    <CameraContext.Provider value={context}>
      <PerspectiveCamera
        layers={layers}
        name="__triplex_camera"
        position={position}
        ref={perspectiveRef}
      />
      <OrthographicCamera
        layers={layers}
        name="__triplex_camera"
        near={-10}
        ref={orthographicRef}
      />
      {isTriplexCamera && (
        <OrbitControls
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={activeCamera}
          ref={controlsRef}
          target={target}
        />
      )}
      {children}
    </CameraContext.Provider>
  );
}
