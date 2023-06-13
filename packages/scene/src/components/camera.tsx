/**
 * Heavily inspired from @nickyvanurk gist on switching between camera modes.
 * https://gist.github.com/nickyvanurk/9ac33a6aff7dd7bd5cd5b8a20d4db0dc
 */
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useThree } from "@react-three/fiber";
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

const CameraContext = createContext<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controls: React.MutableRefObject<any | null>;
}>({
  controls: { current: null },
});

export const useCameraRefs = () => {
  const context = useContext(CameraContext);
  return context;
};

export function Camera({
  position,
  layers,
  target,
}: {
  position: Vector3Tuple;
  layers?: Layers;
  target: Vector3Tuple;
}) {
  const [type, setType] = useState<"perspective" | "orthographic">(
    "perspective"
  );
  const defaultCamera = useThree((three) => three.camera);
  const prevType = useRef<"perspective" | "orthographic">();
  const orthographicRef = useRef<THREE.OrthographicCamera>(null!);
  const perspectiveRef = useRef<THREE.PerspectiveCamera>(null!);
  const refs = useCameraRefs();
  const [activeCamera, setActiveCamera] = useState<
    THREE.OrthographicCamera | THREE.PerspectiveCamera | undefined
  >(undefined);
  const set = useThree((three) => three.set);

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

      set({ camera: orthographicRef.current });
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

      set({ camera: perspectiveRef.current });
      send("trplx:onCameraTypeChange", { type });

      prevType.current = "perspective";
      setActiveCamera(perspectiveRef.current);
    }
  }, [set, target, type]);

  return (
    <>
      <PerspectiveCamera
        layers={layers}
        position={position}
        ref={perspectiveRef}
      />
      <OrthographicCamera layers={layers} ref={orthographicRef} />
      {activeCamera && (
        <OrbitControls
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={activeCamera}
          // Disable controls if someone has set a default camera.
          enabled={defaultCamera === activeCamera}
          target={target}
          ref={refs.controls}
        />
      )}
    </>
  );
}
