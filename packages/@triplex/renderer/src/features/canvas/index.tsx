/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas as FiberCanvas, type CanvasProps } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { fg } from "@triplex/lib/fg";
import { Fragment, Suspense, useEffect, useReducer } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { TriplexGrid } from "../../components/grid";
import { LoadingTriangle } from "../../components/loading-triangle";
import { Tunnel } from "../../components/tunnel";
import { usePlayState } from "../../stores/use-play-state";
import { defaultLayer, editorLayer } from "../../util/layers";
import { Camera } from "../camera";
import { CameraAxisHelper } from "../camera/camera-axis-helper";
import { FitCameraToScene } from "../camera/camera-fit-scene";
import { CameraGizmo } from "../camera/camera-gizmo";
import { PostProcessing } from "../post-processing";
import { SceneElement } from "../scene-element";
import { useLoadedScene } from "../scene-loader/context";
import { ThreeFiberSelection } from "../selection-three-fiber";
import { CaptureShaderErrors } from "./capture-shader-errors";
import { SceneLights } from "./scene-lights";

export function Canvas({ children, ...props }: CanvasProps) {
  const playState = usePlayState();
  const { exportName, path, provider, providerPath, scene } = useLoadedScene();
  const [resetCount, incrementReset] = useReducer(
    (count: number) => count + 1,
    0,
  );

  useEffect(() => {
    /**
     * This means only components that have a canvas (so either
     * react-three-fiber root, or react root with a Canvas component) can be
     * reset using the scene controls. When we move further into the React DOM
     * building space we'll need to figure out what to do about this so both
     * worlds can be reset without the Canvas being blown away.
     */
    return compose([
      on("request-refresh-scene", incrementReset),
      on("request-state-change", ({ state }) => {
        if (state === "edit") {
          incrementReset();
        }
      }),
    ]);
  }, []);

  return (
    <FiberCanvas
      shadows
      style={{ inset: 0, position: "absolute" }}
      {...props}
      data-skip-hit-test
      raycaster={{
        ...props.raycaster,
        layers:
          playState === "play"
            ? props.raycaster?.layers ?? defaultLayer
            : // This forces the default r3f raycaster to be fired on a different layer (31)
              // than the default layer (0) that object3d's are set to default.
              editorLayer,
      }}
    >
      <CaptureShaderErrors />
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
          resetKeys={[scene, provider]}
        >
          <Suspense
            fallback={
              <Tunnel.In>
                <LoadingTriangle />
              </Tunnel.In>
            }
          >
            <SceneElement
              __component={provider}
              __meta={{
                column: -999,
                line: -999,
                name: "Provider",
                path: providerPath,
                rotate: false,
                scale: false,
                translate: false,
              }}
              forceInsideSceneObjectContext
            >
              <ThreeFiberSelection filter={{ exportName, path }}>
                <Suspense
                  fallback={
                    <Tunnel.In>
                      <LoadingTriangle />
                    </Tunnel.In>
                  }
                >
                  <Fragment key={resetCount}>{children}</Fragment>
                  <FitCameraToScene resetKeys={[path, exportName]} />
                  <SceneLights />
                  <TriplexGrid />
                  {fg("camera_axis_helper") ? (
                    <CameraAxisHelper />
                  ) : (
                    <CameraGizmo />
                  )}
                </Suspense>
              </ThreeFiberSelection>
            </SceneElement>
          </Suspense>
        </ErrorBoundaryForScene>
      </Camera>
      {fg("selection_postprocessing") && <PostProcessing />}
    </FiberCanvas>
  );
}
