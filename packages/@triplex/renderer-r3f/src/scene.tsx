/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { Suspense, useCallback, useState, type PropsWithChildren } from "react";
import { Canvas } from "./canvas";
import { Camera } from "./components/camera";
import { CameraGizmo } from "./components/camera-gizmo";
import { ErrorBoundaryForScene } from "./components/error-boundary";
import { ErrorFallback } from "./components/error-fallback";
import { TriplexGrid } from "./components/grid";
import { LoadingTriangle } from "./components/loading-triangle";
import { PostProcessing } from "./components/post-processing";
import { SubsequentSuspense } from "./components/suspense";
import { Tunnel } from "./components/tunnel";
import { SceneLoader } from "./loader";
import { ManualEditableSceneObject } from "./manual-editable";
import { Selection } from "./selection";

export function SceneFrame({
  provider: Provider,
  providerPath,
}: {
  provider: (props: PropsWithChildren) => JSX.Element;
  providerPath: string;
}) {
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
    },
  );

  const onFocus = useCallback(
    (data: {
      column: number;
      line: number;
      parentPath: string;
      path: string;
    }) => {
      send("element-focused", data);
    },
    [],
  );

  const onBlurObject = useCallback(() => {
    send("element-blurred", undefined);
  }, []);

  return (
    <Canvas>
      <Camera>
        <ErrorBoundaryForScene
          fallbackRender={() => <ErrorFallback />}
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
                <SubsequentSuspense
                  fallback={
                    <Tunnel.In>
                      <LoadingTriangle />
                    </Tunnel.In>
                  }
                >
                  <ErrorBoundaryForScene
                    fallbackRender={() => <ErrorFallback />}
                    onError={(err) =>
                      send("error", {
                        message: err.message,
                        source: component.path,
                        stack: err.message,
                        subtitle:
                          "The scene could not be rendered as there was an error parsing its module. Resolve the error and try again.",
                        title: "Module Error",
                      })
                    }
                    resetKeys={[component]}
                  >
                    <SceneLoader
                      exportName={component.exportName}
                      path={component.path}
                      sceneProps={component.props}
                    />
                  </ErrorBoundaryForScene>
                </SubsequentSuspense>
              </Selection>
            </ManualEditableSceneObject>
            <CameraGizmo />
          </Suspense>
        </ErrorBoundaryForScene>
        <TriplexGrid />
      </Camera>

      {fg("selection_postprocessing") && <PostProcessing />}
    </Canvas>
  );
}
