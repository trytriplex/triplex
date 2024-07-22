/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame, useThree, type Size } from "@react-three/fiber";
import { compose, on } from "@triplex/bridge/client";
import {
  default as CCIMPL,
  type default as CameraControlsImpl,
} from "camera-controls";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Spherical,
  Vector3,
  type OrthographicCamera,
  type PerspectiveCamera,
  type Vector3Tuple,
} from "three";
import { CameraControls } from "triplex-drei";
import { ALL_LAYERS } from "../util/layers";
import { buildSceneSphere, findObject3D } from "../util/scene";
import { Tunnel } from "./tunnel";

const TRIPLEX_CAMERA_NAME = "__triplex_camera";
const DEFAULT_CAMERA = "perspective";
const DEFAULT_POSITION: Vector3Tuple = [0, 0, 1];
const CameraAction = CCIMPL.ACTION;

const mouseHotkeys = {
  ctrl: {},
  rest: {
    left: CameraAction.ROTATE,
    middle: CameraAction.DOLLY,
    right: CameraAction.TRUCK,
  },
  shift: {
    left: CameraAction.TRUCK,
  },
} satisfies Record<string, Partial<CameraControlsImpl["mouseButtons"]>>;

const touchHotkeys = {
  ctrl: {},
  rest: {},
  shift: {},
} satisfies Record<string, Partial<CameraControlsImpl["touches"]>>;

type CameraType = OrthographicCamera | PerspectiveCamera;

interface CameraContextType {
  camera: CameraType | undefined;
  controls: React.MutableRefObject<CameraControlsImpl | null>;
  isTriplexCamera: boolean;
}

function apply<TKey extends string>(
  a: Record<TKey, number>,
  b: Partial<Record<TKey, number>>,
) {
  const allB = b as Record<TKey, number>;
  for (const key in b) {
    a[key] = allB[key];
  }
}

const CameraContext = createContext<CameraContextType>({
  camera: undefined,
  controls: { current: null },
  isTriplexCamera: true,
});

function fitCameraToViewport(camera: CameraType, size: Size) {
  if ("isOrthographicCamera" in camera) {
    const left = size.width / -2;
    const right = size.width / 2;
    const top = size.height / 2;
    const bottom = size.height / -2;

    camera.left = left;
    camera.right = right;
    camera.top = top;
    camera.bottom = bottom;
    camera.updateProjectionMatrix();
  } else {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }
}

export function useCamera() {
  const context = useContext(CameraContext);
  return context;
}

export function FitCameraToScene({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const { controls } = useCamera();
  const scene = useThree((store) => store.scene);

  useLayoutEffect(() => {
    if (controls.current) {
      const sphere = buildSceneSphere(scene);
      if (sphere.isEmpty()) {
        return;
      }

      const point = new Spherical().setFromVector3(
        // Z forward rotation.
        new Vector3(0, 0, 1),
      );
      controls.current.rotateTo(point.theta, point.phi, false);
      controls.current.fitToSphere(sphere, false);
    }
  }, [controls, scene, id]);

  return <>{children}</>;
}

export function Camera({
  children,
  defaultCamera = DEFAULT_CAMERA,
}: {
  children?: React.ReactNode;
  defaultCamera?: "perspective" | "orthographic" | "user";
}) {
  // This is the source of truth for what camera is active.
  // When this is set it propagates to the editor frame in the effect.
  const [type, setType] = useState<"perspective" | "orthographic" | "user">(
    defaultCamera,
  );
  const scene = useThree((state) => state.scene);
  const set = useThree((state) => state.set);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const prevTriplexCamera = useRef<"perspective" | "orthographic">();
  const orthCameraRef = useRef<OrthographicCamera>(null!);
  const perspCameraRef = useRef<PerspectiveCamera>(null!);
  const controlsRef = useRef<CameraControlsImpl>(null);
  const [activeCamera, setActiveCamera] = useState<CameraType | undefined>(
    undefined,
  );
  const isTriplexCamera =
    activeCamera && activeCamera.name === TRIPLEX_CAMERA_NAME;
  const previousUserlandCamera = useRef<CameraType | undefined>();
  const [modifier, setModifier] = useState<"Rest" | "Shift" | "Control">(
    "Rest",
  );

  useEffect(() => {
    if (!controlsRef.current) {
      return;
    }

    switch (modifier) {
      case "Control":
        apply(controlsRef.current.touches, touchHotkeys.ctrl);
        apply(controlsRef.current.mouseButtons, mouseHotkeys.ctrl);
        break;

      case "Shift":
        apply(controlsRef.current.touches, touchHotkeys.shift);
        apply(controlsRef.current.mouseButtons, mouseHotkeys.shift);
        break;

      default:
        apply(controlsRef.current.touches, touchHotkeys.rest);
        apply(controlsRef.current.mouseButtons, mouseHotkeys.rest);
        break;
    }
  }, [modifier, activeCamera]);

  useEffect(() => {
    let intervalId: number;

    const applyCameraModifiers = (event: KeyboardEvent) => {
      function beginPollingForDocumentFocusLoss() {
        window.clearInterval(intervalId);
        intervalId = window.setInterval(() => {
          if (!document.hasFocus()) {
            window.clearInterval(intervalId);
            setModifier("Rest");
          }
        }, 200);
      }

      switch (event.key) {
        case "Shift":
        case "Control":
          beginPollingForDocumentFocusLoss();
          setModifier(event.key);
          break;
      }
    };

    const resetFromKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Shift":
        case "Control":
          window.clearInterval(intervalId);
          setModifier("Rest");
          break;
      }
    };

    const resetFromVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.clearInterval(intervalId);
        setModifier("Rest");
      }
    };

    document.addEventListener("keydown", applyCameraModifiers);
    document.addEventListener("keyup", resetFromKeyUp);
    document.addEventListener("visibilitychange", resetFromVisibilityChange);

    return () => {
      document.removeEventListener("keydown", applyCameraModifiers);
      document.removeEventListener("keyup", resetFromKeyUp);
      document.removeEventListener(
        "visibilitychange",
        resetFromVisibilityChange,
      );
    };
  }, []);

  useEffect(() => {
    return on("request-state-change", ({ camera, state }) => {
      if (state !== "edit" && camera === "default") {
        setType("user");
        setActiveCamera(previousUserlandCamera.current);
      } else {
        setType(prevTriplexCamera.current || DEFAULT_CAMERA);
      }
    });
  }, []);

  useEffect(() => {
    return compose([
      on("control-triggered", (data) => {
        switch (data.id) {
          case "perspective":
          case "orthographic": {
            if (type === "user") {
              return;
            }

            setType(data.id);
            return { handled: true };
          }
        }
      }),
      on("element-action-triggered", (data) => {
        switch (data.id) {
          case "camera_enter": {
            const camera = findObject3D(scene, {
              column: data.data.column,
              line: data.data.line,
              path: data.data.parentPath,
            });

            if (
              camera &&
              ["PerspectiveCamera", "OrthographicCamera"].includes(camera.type)
            ) {
              setType("user");
              setActiveCamera(camera as CameraType);
              return { handled: true };
            } else {
              return { handled: false };
            }
          }

          case "camera_exit": {
            setType(prevTriplexCamera.current || DEFAULT_CAMERA);
            setActiveCamera(
              prevTriplexCamera.current === "orthographic"
                ? orthCameraRef.current
                : perspCameraRef.current,
            );
            return { handled: true };
          }
        }
      }),
    ]);
  }, [scene, type]);

  useLayoutEffect(() => {
    if (type === "orthographic") {
      prevTriplexCamera.current = "orthographic";
      setActiveCamera(orthCameraRef.current);
    } else if (type === "perspective") {
      prevTriplexCamera.current = "perspective";
      setActiveCamera(perspCameraRef.current);
    }
  }, [scene, type]);

  useLayoutEffect(() => {
    function fitCameras() {
      const size: Size = {
        height: gl.domElement.clientHeight,
        left: 0,
        top: 0,
        width: gl.domElement.clientWidth,
      };

      fitCameraToViewport(orthCameraRef.current, size);
      fitCameraToViewport(perspCameraRef.current, size);
      fitCameraToViewport(camera, size);
    }

    const observer = new ResizeObserver(fitCameras);
    observer.observe(gl.domElement);

    return () => {
      observer.disconnect();
    };
  }, [camera, gl.domElement]);

  useFrame(({ camera, gl, scene }) => {
    if (activeCamera) {
      // Force the Triplex active camera to be the active camera.
      // We sidestep the R3F state management here because we want to be able to
      // control which camera is active (userland vs. Triplex).
      gl.render(scene, activeCamera);

      if (camera !== activeCamera) {
        // Ensure r3f state has our camera as the active camera.
        set({ camera: activeCamera });

        if (
          camera !== perspCameraRef.current &&
          camera !== orthCameraRef.current
        ) {
          // Keep track of the last non-triplex camera so we can set it back when appropriate.
          previousUserlandCamera.current = camera;
        }
      }
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  const context: CameraContextType = useMemo(
    () => ({
      camera: activeCamera,
      controls: controlsRef,
      isTriplexCamera: !!isTriplexCamera,
    }),
    [activeCamera, isTriplexCamera],
  );

  return (
    <CameraContext.Provider value={context}>
      {children}
      <perspectiveCamera
        far={100_000}
        layers={ALL_LAYERS}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name={TRIPLEX_CAMERA_NAME}
        near={0.01}
        position={DEFAULT_POSITION}
        ref={perspCameraRef}
      />
      <orthographicCamera
        far={100_000}
        layers={ALL_LAYERS}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name={TRIPLEX_CAMERA_NAME}
        near={-100}
        position={DEFAULT_POSITION}
        ref={orthCameraRef}
        zoom={100}
      />
      {isTriplexCamera && (
        <CameraControls
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={activeCamera}
          ref={controlsRef}
        />
      )}

      {import.meta.env.VITE_TRIPLEX_ENV === "test" && (
        <Tunnel.In>
          <pre
            data-testid="camera-panel"
            style={{
              backgroundColor: "white",
              bottom: 4,
              left: 4,
              margin: 0,
              opacity: 0.5,
              padding: 4,
              pointerEvents: "none",
              position: "absolute",
            }}
          >
            {`name: ${activeCamera?.name || "(empty)"}
type: ${type}
pos: `}
            <PullCameraPosition__DEV_ONLY__ controls={controlsRef} />
          </pre>
        </Tunnel.In>
      )}
    </CameraContext.Provider>
  );
}

function PullCameraPosition__DEV_ONLY__({
  controls,
}: {
  controls: React.RefObject<CCIMPL>;
}) {
  const [pos, setPos] = useState<string | number>("");

  useEffect(() => {
    const id = setInterval(() => {
      setPos(
        controls.current
          ?.getTarget(new Vector3())
          .toArray()
          .map((p) => Math.round(p * 100) / 100)
          .join(",") || "(empty)",
      );
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [controls]);

  return pos;
}
