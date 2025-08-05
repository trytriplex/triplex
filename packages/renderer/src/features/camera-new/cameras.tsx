/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { on } from "@triplex/bridge/client";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type OrthographicCamera, type PerspectiveCamera } from "three";
import { usePlayState } from "../../stores/use-play-state";
import { EDITOR_LAYER_INDEX, HIDDEN_LAYER_INDEX } from "../../util/layers";
import {
  ActiveCameraContext,
  DefaultCameraContext,
  type ActiveCameraContextValue,
} from "./context";
import { fitCamerasToViewport } from "./fit-cameras-to-viewport";
import { type CanvasCamera, type EditorCameraType } from "./types";

interface ModeState {
  edit: CanvasCamera;
  editor: EditorCameraType;
  play: CanvasCamera;
}

type ModeActions =
  | {
      action: "set-canvas-camera";
      camera: CanvasCamera;
    }
  | {
      action: "set-editor-camera-type";
      type: EditorCameraType;
    };

export function Cameras({ children }: { children: ReactNode }) {
  const defaultEditorCamera = useContext(DefaultCameraContext);
  const [editorCameraAsDefault, setEditorCameraAsDefault] = useState(false);
  const defaultCamera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const set = useThree((state) => state.set);
  const lastUserCamera = useRef(defaultCamera);
  const [perspective, setPerspective] = useState<PerspectiveCamera>();
  const [orthographic, setOrthographic] = useState<OrthographicCamera>();
  const playState = usePlayState();
  const [state, setCameraState] = useReducer<ModeState, [ModeActions]>(
    (state, action) => {
      if (action.action === "set-canvas-camera") {
        if (playState === "edit") {
          return { ...state, edit: action.camera };
        }

        return { ...state, play: action.camera };
      }

      if (action.action === "set-editor-camera-type") {
        return { ...state, editor: action.type };
      }

      return state;
    },
    { edit: defaultEditorCamera, editor: "perspective", play: "default" },
  );
  const activeState = playState === "edit" ? state.edit : state.play;
  const activeCamera =
    activeState === "default"
      ? defaultCamera
      : state.editor === "perspective"
        ? perspective
        : orthographic;

  useEffect(() => {
    if (defaultCamera !== orthographic && defaultCamera !== perspective) {
      // Captures the last known user camera so we can restore it when appropriate.
      lastUserCamera.current = defaultCamera;
    }
  }, [defaultCamera, orthographic, perspective]);

  useLayoutEffect(() => {
    if (!perspective || !orthographic) {
      return;
    }

    return fitCamerasToViewport(gl, [defaultCamera, perspective, orthographic]);
  }, [defaultCamera, gl, orthographic, perspective]);

  useEffect(() => {
    if (editorCameraAsDefault && activeCamera && activeState === "editor") {
      set({
        camera: activeCamera,
      });

      return () => {
        set({ camera: lastUserCamera.current });
      };
    }
  }, [set, editorCameraAsDefault, activeCamera, activeState]);

  useEffect(() => {
    return on("extension-point-triggered", ({ id, scope }) => {
      if (scope !== "scene") {
        return;
      }

      switch (id) {
        case "camera_editor_toggle_default":
          setEditorCameraAsDefault((prev) => !prev);
          break;

        case "camera_editor":
          setCameraState({ action: "set-canvas-camera", camera: "editor" });
          break;
        case "camera_default":
          setCameraState({ action: "set-canvas-camera", camera: "default" });
          break;

        case "perspective":
        case "orthographic":
          setCameraState({ action: "set-editor-camera-type", type: id });
          return { handled: true };
      }
    });
  }, [defaultCamera]);

  useEffect(() => {
    if (!activeCamera) {
      return;
    }

    switch (playState) {
      case "edit":
      case "pause":
        activeCamera.layers.enable(EDITOR_LAYER_INDEX);
        activeCamera.layers.enable(HIDDEN_LAYER_INDEX);
        break;
      case "play":
        activeCamera.layers.disable(EDITOR_LAYER_INDEX);
        activeCamera.layers.disable(HIDDEN_LAYER_INDEX);
        break;
    }
  }, [activeCamera, playState]);

  useLayoutEffect(() => {
    if (!activeCamera || activeState !== "editor") {
      return;
    }

    const render = gl.render;

    gl.render = function renderOverride(scene, camera, ...args) {
      if (camera === defaultCamera && args.at(0) !== "triplex_ignore") {
        // This forces anyone calling gl.render (like postprocessing) to be forced to
        // render through the active camera instead of the default react-three camera
        // when the "editor" camera is active.
        return render.call(this, scene, activeCamera, ...args);
      }

      // Fallback to the original function with no changes if the passed in camera isn't default
      // or we've explicitly ignored it by passing "triplex_ignore" as done in {@link ../camera-preview/index.tsx}.
      return render.call(this, scene, camera, ...args);
    };

    return () => {
      gl.render = render;
    };
  }, [gl, activeCamera, activeState, defaultCamera]);

  useFrame(
    ({ gl, scene }) => {
      if (activeCamera) {
        // Postprocessing sets this to false which breaks the outline selection
        // indicators as they don't get unset. This turns it back on and gets it working again.
        gl.autoClear = true;
        gl.render(scene, activeCamera);
      }
    },
    activeState === "editor"
      ? // When the "editor" camera is active we use 0.5 so the callback runs before postprocessing.
        // See: https://github.com/pmndrs/react-postprocessing/blob/master/src/EffectComposer.tsx#L63
        0.5
      : // When the "default" camera is active we release rendering back to defaults.
        undefined,
  );

  const context: ActiveCameraContextValue = useMemo(
    () => (activeCamera ? { camera: activeCamera, type: activeState } : null),
    [activeCamera, activeState],
  );

  return (
    <ActiveCameraContext.Provider value={context}>
      {children}
      <perspectiveCamera
        far={100_000}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name="triplex_perspective"
        near={0.01}
        position={[0, 0, 1]}
        ref={setPerspective}
      />
      <orthographicCamera
        far={100_000}
        // Opt out from r3f auto update updating the frustum.
        // @ts-expect-error
        manual
        name="triplex_orthographic"
        near={-100}
        position={[0, 0, 1]}
        ref={setOrthographic}
        zoom={100}
      />
    </ActiveCameraContext.Provider>
  );
}
