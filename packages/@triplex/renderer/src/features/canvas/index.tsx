/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas as FiberCanvas } from "@react-three/fiber";
import { compose, on, send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
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
import { Selection } from "../selection";
import { SceneLights } from "./scene-lights";

// Inspired from from Three.js
// See: https://github.com/mrdoob/three.js/blob/34ba5129de62d538c17616f50cd00e36fdb98398/src/renderers/webgl/WebGLProgram.js#L14
function resolveLineThatErrored(string: string | null, errorLine: number) {
  if (string === null) {
    return "";
  }

  const lines = string.split("\n");
  const line = lines[errorLine - 1];

  return line;
}

// Inspired from Three.js
// See: https://github.com/mrdoob/three.js/blob/34ba5129de62d538c17616f50cd00e36fdb98398/src/renderers/webgl/WebGLProgram.js#L57
function getShaderErrors(gl: WebGLRenderingContext, shader: WebGLShader) {
  const errors = gl.getShaderInfoLog(shader)?.trim().replaceAll("\n", "");
  if (!errors) {
    return "";
  }

  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {
    const errorLine = Number.parseInt(errorMatches[1]);
    const content = resolveLineThatErrored(
      gl.getShaderSource(shader),
      errorLine,
    );
    return `"${errors}" from line "${content}"`;
  } else {
    return errors;
  }
}

export function Canvas({ children, ...props }: { children: React.ReactNode }) {
  const playState = usePlayState();
  const { exportName, path, provider, providerPath, scene } = useLoadedScene();
  const [resetCount, incrementReset] = useReducer(
    (count: number) => count + 1,
    0,
  );

  const onShaderError = useEvent(
    (
      gl: WebGLRenderingContext,
      program: WebGLProgram,
      glVertexShader: WebGLShader,
      glFragmentShader: WebGLShader,
    ) => {
      const vertexErrors = getShaderErrors(gl, glVertexShader);
      const fragmentErrors = getShaderErrors(gl, glFragmentShader);

      let errorMessage;

      if (vertexErrors && fragmentErrors) {
        errorMessage = `Vertex and fragment shaders failed to compile. The vertex shader errored with ${vertexErrors} and the fragment shader errored with ${fragmentErrors}.`;
      } else if (vertexErrors) {
        errorMessage = `A vertex shader failed to compile because of the error ${vertexErrors}.`;
      } else if (fragmentErrors) {
        errorMessage = `A fragment shader failed to compile because of the error ${fragmentErrors}.`;
      } else {
        const programLog = gl
          .getProgramInfoLog(program)
          ?.trim()
          .replaceAll("\n", "");
        errorMessage = `A shader failed to compile because of the error "${programLog}".`;
      }

      send("error", {
        message: errorMessage,
        subtitle: "",
        title: "GLSL Error",
      });
    },
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
      gl={{
        debug: {
          checkShaderErrors: true,
          onShaderError,
        },
        ...(typeof window.triplex.renderer.attributes.gl === "object"
          ? window.triplex.renderer.attributes.gl
          : undefined),
        antialias: true,
      }}
      raycaster={{
        layers:
          playState === "play"
            ? defaultLayer
            : // This forces the default r3f raycaster to be fired on a different layer (31)
              // than the default layer (0) that object3d's are set to default.
              editorLayer,
      }}
    >
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
              <Selection filter={{ exportName, path }}>
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
              </Selection>
            </SceneElement>
          </Suspense>
        </ErrorBoundaryForScene>
      </Camera>
      {fg("selection_postprocessing") && <PostProcessing />}
    </FiberCanvas>
  );
}
