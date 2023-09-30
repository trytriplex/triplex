/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useSearchParams } from "react-router-dom";
import { listen, send } from "@triplex/bridge/client";
import { Grid } from "triplex-drei";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react";
import { Box3, Layers, Vector3, Vector3Tuple } from "three";
import { Canvas } from "./canvas";
import { Selection } from "./selection";
import { SceneLoader } from "./loader";
import { AddSceneObject } from "./add-scene-object";
import { SceneErrorBoundary } from "./error-boundary";
import { Camera } from "./components/camera";
import { ManualEditableSceneObject } from "./manual-editable";
import { useEnvironment } from "./environment";

const V1 = new Vector3();
const layers = new Layers();
layers.enableAll();

const defaultFocalPoint: { grid: Vector3Tuple; objectCenter: Vector3Tuple } = {
  grid: [0, 0, 0],
  objectCenter: [0, 0, 0],
};

export function SceneFrame({
  provider: Provider,
}: {
  provider: (props: PropsWithChildren) => JSX.Element;
}) {
  const [resetCount, incrementReset] = useReducer((s: number) => s + 1, 0);
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const props = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const sceneProps = useMemo<Record<string, unknown>>(
    () => (props ? JSON.parse(decodeURIComponent(props)) : {}),
    [props]
  );
  const env = useEnvironment();
  const [focalPoint, setFocalPoint] = useState(defaultFocalPoint);
  const { target, position } = useMemo(() => {
    const actualCameraPosition: Vector3Tuple = [...focalPoint.objectCenter];
    actualCameraPosition[1] += 2;
    actualCameraPosition[2] += 7;
    return { target: focalPoint.objectCenter, position: actualCameraPosition };
  }, [focalPoint]);

  if (path && !exportName) {
    throw new Error("invariant: exportName is undefined");
  }

  useEffect(() => {
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the scene by instead of handling
      // events directly we forward the hotkey press to the editor and it can figure
      // it out.
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.keyCode === 83 &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        send("trplx:requestSave", undefined);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path]);

  useEffect(() => {
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the scene by instead of handling
      // events directly we forward the hotkey press to the editor and it can figure
      // it out.
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.shiftKey
      ) {
        send("trplx:requestRedo", undefined);
      } else if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        send("trplx:requestUndo", undefined);
      } else if (
        e.key === "Backspace" &&
        document.activeElement === document.body
      ) {
        send("trplx:requestDeleteSceneObject", undefined);
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path]);

  const onJumpTo = useCallback((position: Vector3Tuple, box: Box3) => {
    setFocalPoint({
      // If the box is empty (as the object takes up no 3d space, like a light)
      // We instead use the position instead of the center position.
      objectCenter: box.isEmpty() ? position : box.getCenter(V1).toArray(),
      grid: [position[0], 0, position[2]],
    });
  }, []);

  const onNavigate = useCallback(
    (selected: { path: string; exportName: string; encodedProps: string }) => {
      setSearchParams(
        (prev) => ({
          ...Object.fromEntries(prev.entries()),
          path: selected.path,
          exportName: selected.exportName,
          props: selected.encodedProps,
        }),
        { replace: true }
      );

      send("trplx:onSceneObjectNavigated", { ...selected, entered: true });
    },
    [setSearchParams]
  );

  const onFocus = useCallback(
    (data: {
      column: number;
      line: number;
      path: string;
      parentPath: string;
    }) => {
      // This will be serialized so we create a new object just in case.
      send("trplx:onSceneObjectFocus", {
        column: data.column,
        line: data.line,
        parentPath: data.parentPath,
        path: data.path,
      });
    },
    []
  );

  const onBlurObject = useCallback(() => {
    send("trplx:onSceneObjectBlur", undefined);
  }, []);

  useEffect(() => {
    return listen("trplx:requestRefresh", (data) => {
      if (data.hard) {
        return;
      }

      incrementReset();
    });
  }, []);

  return (
    <Canvas>
      <Camera target={target} position={position} layers={layers}>
        <Suspense fallback={null}>
          <Selection
            path={path}
            onBlur={onBlurObject}
            onFocus={onFocus}
            onJumpTo={onJumpTo}
            onNavigate={onNavigate}
            exportName={exportName}
          >
            <SceneErrorBoundary>
              <Suspense fallback={null}>
                <ManualEditableSceneObject
                  key={resetCount}
                  component={Provider}
                  exportName="default"
                  id={-999}
                  path={env.config.provider}
                >
                  <SceneLoader
                    path={path}
                    exportName={exportName}
                    sceneProps={sceneProps}
                  />
                  <AddSceneObject key={path} path={path} />
                </ManualEditableSceneObject>
              </Suspense>
            </SceneErrorBoundary>
          </Selection>
        </Suspense>
      </Camera>

      <Grid
        sectionColor="#9d4b4b"
        cellColor="#6f6f6f"
        cellThickness={1.0}
        infiniteGrid
        fadeDistance={30}
        cellSize={1}
        sectionSize={3}
        fadeStrength={1.5}
        position={focalPoint.grid}
      />
    </Canvas>
  );
}
