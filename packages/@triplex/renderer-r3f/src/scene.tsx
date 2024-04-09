/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on, send } from "@triplex/bridge/client";
import {
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Grid } from "triplex-drei";
import { Canvas } from "./canvas";
import { Camera, FitCameraToScene } from "./components/camera";
import { CameraGizmo } from "./components/camera-gizmo";
import { LoadingTriangle } from "./components/loading-triangle";
import { SubsequentSuspense } from "./components/suspense";
import { Tunnel } from "./components/tunnel";
import { SceneLoader } from "./loader";
import { ManualEditableSceneObject } from "./manual-editable";
import { Selection } from "./selection";
import { editorLayer } from "./util/layers";
import useEvent from "./util/use-event";

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
    return on("request-refresh-scene", incrementReset);
  }, []);

  return (
    <Canvas>
      <Camera>
        <ErrorBoundary
          fallbackRender={() => null}
          onError={(err) =>
            send("error", {
              message: err.message,
              source: providerPath,
              stack: err.stack,
              subtitle:
                "The scene could not be rendered because there was an error in the provider component. Resolve the errors and try again.",
              title: "Could not render scene",
            })
          }
          resetKeys={[component, Provider]}
        >
          <Suspense
            fallback={
              <Tunnel.In>
                <LoadingTriangle />
              </Tunnel.In>
            }
          >
            <ManualEditableSceneObject
              component={Provider}
              exportName="__exclude__"
              id={-999}
              path={providerPath}
            >
              <Selection
                filter={component}
                onBlur={onBlurObject}
                onFocus={onFocus}
                onNavigate={onNavigate}
              >
                <ErrorBoundary
                  fallbackRender={() => null}
                  resetKeys={[component]}
                >
                  <SubsequentSuspense
                    fallback={
                      <Tunnel.In>
                        <LoadingTriangle />
                      </Tunnel.In>
                    }
                  >
                    <FitCameraToScene
                      trigger={component.path + component.exportName}
                    >
                      <SceneLoader
                        exportName={component.exportName}
                        key={resetCount}
                        path={component.path}
                        sceneProps={component.props}
                      />
                    </FitCameraToScene>
                  </SubsequentSuspense>
                </ErrorBoundary>
              </Selection>
            </ManualEditableSceneObject>
            <CameraGizmo />
          </Suspense>
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
        layers={editorLayer}
        sectionColor="#9d4b4b"
        sectionSize={3}
        side={2}
      />
    </Canvas>
  );
}
