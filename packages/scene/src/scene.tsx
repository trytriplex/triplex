/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { listen, send } from "@triplex/bridge/client";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Box3, Layers, Vector3, Vector3Tuple } from "three";
import { Grid } from "triplex-drei";
import { AddSceneObject } from "./add-scene-object";
import { Canvas } from "./canvas";
import { Camera } from "./components/camera";
import { useEnvironment } from "./environment";
import { SceneErrorBoundary } from "./error-boundary";
import { SceneLoader } from "./loader";
import { ManualEditableSceneObject } from "./manual-editable";
import { Selection } from "./selection";

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
  const { position, target } = useMemo(() => {
    const actualCameraPosition: Vector3Tuple = [...focalPoint.objectCenter];
    actualCameraPosition[1] += 2;
    actualCameraPosition[2] += 7;
    return { position: actualCameraPosition, target: focalPoint.objectCenter };
  }, [focalPoint]);

  if (path && !exportName) {
    throw new Error("invariant: exportName is undefined");
  }

  const onJumpTo = useCallback((position: Vector3Tuple, box: Box3) => {
    setFocalPoint({
      grid: [position[0], 0, position[2]],
      // If the box is empty (as the object takes up no 3d space, like a light)
      // We instead use the position instead of the center position.
      objectCenter: box.isEmpty() ? position : box.getCenter(V1).toArray(),
    });
  }, []);

  const onNavigate = useCallback(
    (selected: { encodedProps: string; exportName: string; path: string }) => {
      setSearchParams(
        (prev) => ({
          ...Object.fromEntries(prev.entries()),
          exportName: selected.exportName,
          path: selected.path,
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
      parentPath: string;
      path: string;
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
      <Camera layers={layers} position={position} target={target}>
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <ManualEditableSceneObject
              component={Provider}
              exportName="__exclude__"
              id={-999}
              key={resetCount}
              path={env.config.provider}
            >
              <Selection
                exportName={exportName}
                onBlur={onBlurObject}
                onFocus={onFocus}
                onJumpTo={onJumpTo}
                onNavigate={onNavigate}
                path={path}
              >
                <SceneLoader
                  exportName={exportName}
                  path={path}
                  sceneProps={sceneProps}
                />
                <AddSceneObject key={path} path={path} />
              </Selection>
            </ManualEditableSceneObject>
          </Suspense>
        </SceneErrorBoundary>
      </Camera>

      <Grid
        cellColor="#6f6f6f"
        cellSize={1}
        cellThickness={1.0}
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
        position={focalPoint.grid}
        sectionColor="#9d4b4b"
        sectionSize={3}
      />
    </Canvas>
  );
}
