/**
 * Heavily inspired from @nickyvanurk gist on switching between camera modes.
 * https://gist.github.com/nickyvanurk/9ac33a6aff7dd7bd5cd5b8a20d4db0dc
 */
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "triplex-drei";
import { Layers, Vector3, Vector3Tuple } from "three";
import { listen, send } from "@triplex/bridge/client";

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
    data: { line: number; column: number; path: string }
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
  position,
  layers,
  target,
  children,
}: {
  position: Vector3Tuple;
  layers?: Layers;
  target: Vector3Tuple;
  children?: React.ReactNode;
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
        name="__triplex_camera"
        layers={layers}
        position={position}
        ref={perspectiveRef}
      />
      <OrthographicCamera
        name="__triplex_camera"
        layers={layers}
        ref={orthographicRef}
        near={-10}
      />
      {isTriplexCamera && (
        <OrbitControls
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={activeCamera}
          target={target}
          ref={controlsRef}
        />
      )}
      {children}
    </CameraContext.Provider>
  );
}
