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
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Vector3,
  type OrthographicCamera,
  type PerspectiveCamera,
  type Vector3Tuple,
} from "three";
import { CameraControls } from "triplex-drei";
import { Tunnel } from "../../components/tunnel";
import { allLayers } from "../../util/layers";
import { findObject3D } from "../../util/scene";
import {
  CameraContext,
  type CameraContextType,
  type CameraType,
} from "./context";

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

function apply<TKey extends string>(
  a: Record<TKey, number>,
  b: Partial<Record<TKey, number>>,
) {
  const allB = b as Record<TKey, number>;
  for (const key in b) {
    a[key] = allB[key];
  }
}

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
  const [controlsInstance, setControlsInstance] =
    useState<CameraControlsImpl | null>(null);
  const [activeCamera, setActiveCamera] = useState<CameraType | null>(null);
  const isTriplexCamera =
    activeCamera && activeCamera.name === TRIPLEX_CAMERA_NAME;
  const previousUserlandCamera = useRef<CameraType | null>(null);
  const [modifier, setModifier] = useState<"Rest" | "Shift" | "Control">(
    "Rest",
  );

  useEffect(() => {
    if (!controlsInstance) {
      return;
    }

    switch (modifier) {
      case "Control":
        apply(controlsInstance.touches, touchHotkeys.ctrl);
        apply(controlsInstance.mouseButtons, mouseHotkeys.ctrl);
        break;

      case "Shift":
        apply(controlsInstance.touches, touchHotkeys.shift);
        apply(controlsInstance.mouseButtons, mouseHotkeys.shift);
        break;

      default:
        apply(controlsInstance.touches, touchHotkeys.rest);
        apply(controlsInstance.mouseButtons, mouseHotkeys.rest);
        break;
    }
  }, [modifier, activeCamera, controlsInstance]);

  useEffect(() => {
    let intervalId: number;

    const applyCameraModifiers = (event: KeyboardEvent) => {
      if (event.key !== "Shift" && event.key !== "Control") {
        setModifier("Rest");
        return;
      }

      function beginPollingForDocumentFocusLoss() {
        if (!document.hasFocus()) {
          // The iframe document doesn't have focus right now so the event
          // has originated from the parent document. We skip polling here
          // and instead wait for the next keyup event to reset the modifier.
          return;
        }

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

    window.addEventListener("keydown", applyCameraModifiers);
    window.addEventListener("keyup", resetFromKeyUp);
    window.addEventListener("visibilitychange", resetFromVisibilityChange);

    return () => {
      window.removeEventListener("keydown", applyCameraModifiers);
      window.removeEventListener("keyup", resetFromKeyUp);
      window.removeEventListener("visibilitychange", resetFromVisibilityChange);
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
      on("extension-point-triggered", (data) => {
        if (data.scope !== "scene") {
          return;
        }

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
      on("extension-point-triggered", (data) => {
        if (data.scope !== "element") {
          return;
        }

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
      controls: controlsInstance,
      isTriplexCamera: !!isTriplexCamera,
    }),
    [activeCamera, controlsInstance, isTriplexCamera],
  );

  const setControlsInstanceFromRef = useCallback((ref: CCIMPL | null) => {
    setControlsInstance(ref);
  }, []);

  return (
    <CameraContext.Provider value={context}>
      {children}
      <perspectiveCamera
        far={100_000}
        layers={allLayers}
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
        layers={allLayers}
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
          ref={setControlsInstanceFromRef}
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
            {controlsInstance && (
              <PullCameraPosition controls={controlsInstance} />
            )}
          </pre>
        </Tunnel.In>
      )}
    </CameraContext.Provider>
  );
}

function PullCameraPosition({ controls }: { controls: CCIMPL }) {
  const [pos, setPos] = useState<string | number>("");

  useEffect(() => {
    const id = setInterval(() => {
      setPos(
        controls
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
