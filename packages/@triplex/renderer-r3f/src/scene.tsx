/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on, send } from "@triplex/bridge/client";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Layers, Vector3, type Box3, type Vector3Tuple } from "three";
import { Grid } from "triplex-drei";
import { Canvas } from "./canvas";
import { Camera } from "./components/camera";
import { SubsequentSuspense } from "./components/suspense";
import { SceneLoader } from "./loader";
import { ManualEditableSceneObject } from "./manual-editable";
import { Selection } from "./selection";
import useEvent from "./util/use-event";

const V1 = new Vector3();
const layers = new Layers();
layers.enableAll();

const defaultFocalPoint: Vector3Tuple = [0, 0, 0];

export function SceneFrame({
  provider: Provider,
  providerPath,
}: {
  provider: (props: PropsWithChildren) => JSX.Element;
  providerPath: string;
}) {
  const [resetCount, incrementReset] = useReducer((s: number) => s + 1, 0);
  const [component, setComponent] = useState<{
    exportName: string;
    path: string;
    props: Record<string, unknown>;
  }>({ exportName: "", path: "", props: {} });
  const [focalPoint, setFocalPoint] = useState(defaultFocalPoint);
  const { position, target } = useMemo(() => {
    const actualCameraPosition: Vector3Tuple = [...focalPoint];
    actualCameraPosition[1] += 2;
    actualCameraPosition[2] += 7;
    return { position: actualCameraPosition, target: focalPoint };
  }, [focalPoint]);

  const onJumpTo = useCallback((position: Vector3Tuple, box: Box3) => {
    setFocalPoint(
      // If the box is empty (as the object takes up no 3d space, like a light)
      // We instead use the position instead of the center position.
      box.isEmpty() ? position : box.getCenter(V1).toArray()
    );
  }, []);

  const onNavigate = useEvent(
    (target: {
      exportName: string;
      path: string;
      props: Record<string, unknown>;
    }) => {
      setComponent({
        exportName: target.exportName,
        path: target.path,
        props: target.props,
      });
      send("component-opened", {
        encodedProps: JSON.stringify(target.props),
        entered: true,
        exportName: target.exportName,
        path: target.path,
      });
    }
  );

  const onFocus = useCallback(
    (data: {
      column: number;
      line: number;
      parentPath: string;
      path: string;
    }) => {
      // This will be serialized so we create a new object just in case.
      send("element-focused", {
        column: data.column,
        line: data.line,
        parentPath: data.parentPath,
        path: data.path,
      });
    },
    []
  );

  const onBlurObject = useCallback(() => {
    send("element-blurred", undefined);
  }, []);

  useEffect(() => {
    return on("request-refresh-scene", (data) => {
      if (data.hard) {
        return;
      }

      incrementReset();
    });
  }, []);

  return (
    <Canvas>
      <Camera layers={layers} position={position} target={target}>
        <ErrorBoundary fallbackRender={() => null} resetKeys={[component]}>
          <SubsequentSuspense>
            <ManualEditableSceneObject
              component={Provider}
              exportName="__exclude__"
              id={-999}
              key={resetCount}
              path={providerPath}
            >
              <Selection
                exportName={component.exportName}
                onBlur={onBlurObject}
                onFocus={onFocus}
                onJumpTo={onJumpTo}
                onNavigate={onNavigate}
                path={component.path}
              >
                <ErrorBoundary
                  fallbackRender={() => null}
                  resetKeys={[component]}
                >
                  <SubsequentSuspense>
                    <SceneLoader
                      exportName={component.exportName}
                      path={component.path}
                      sceneProps={component.props}
                    />
                  </SubsequentSuspense>
                </ErrorBoundary>
              </Selection>
            </ManualEditableSceneObject>
          </SubsequentSuspense>
        </ErrorBoundary>
      </Camera>

      <Grid
        cellColor="#6f6f6f"
        cellSize={1}
        cellThickness={1.0}
        fadeDistance={100}
        fadeStrength={5}
        followCamera
        infiniteGrid
        sectionColor="#9d4b4b"
        sectionSize={3}
      />
    </Canvas>
  );
}
