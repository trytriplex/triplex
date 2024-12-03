/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeyboardEvents,
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { TriplexGrid } from "../../components/grid";
import { LoadingTriangle } from "../../components/loading-triangle";
import { SubsequentSuspense } from "../../components/suspense";
import { Tunnel } from "../../components/tunnel";
import { Camera } from "../camera";
import { CameraAxisHelper } from "../camera/camera-axis-helper";
import { CameraGizmo } from "../camera/camera-gizmo";
import { Canvas } from "../canvas";
import { PostProcessing } from "../post-processing";
import { SceneElement } from "../scene-element";
import { SceneLoader } from "../scene-loader";
import { Selection } from "../selection";
import { SceneProvider } from "./context";

export function App({
  files,
  provider: Provider,
  providerPath,
}: {
  files: Modules;
  provider: ProviderComponent;
  providerPath: string;
}) {
  useEffect(() => {
    send("set-extension-points", {
      elements: [
        {
          buttons: [
            {
              icon: "camera",
              id: "camera_enter",
              label: "Enter Camera",
            },
            {
              icon: "exit",
              id: "camera_exit",
              label: "Exit Camera",
            },
          ],
          filter: "PerspectiveCamera|OrthographicCamera",
          groupId: "enter_camera",
          type: "toggle-button",
        },
      ],
      scene: [
        {
          buttons: [
            {
              icon: "world",
              id: "transformlocal",
              label: "Set Local Transform",
            },
            {
              icon: "local",
              id: "transformworld",
              label: "Set World Transform",
            },
          ],
          groupId: "transform_space",
          type: "toggle-button",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "cursor",
              id: "none",
              label: "Select",
            },
            {
              accelerator: "T",
              icon: "move",
              id: "translate",
              label: "Translate",
            },
            {
              accelerator: "R",
              icon: "angle",
              id: "rotate",
              label: "Rotate",
            },
            {
              accelerator: "S",
              icon: "transform",
              id: "scale",
              label: "Scale",
            },
          ],
          defaultSelected: "none",
          groupId: "transform_controls",
          type: "button-group",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "moon",
              id: "default_lights_on",
              label: "Turn On Default Lights",
            },
            {
              icon: "sun",
              id: "default_lights_off",
              label: "Turn Off Default Lights",
            },
          ],
          groupId: "lights",
          type: "toggle-button",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "grid-perspective",
              id: "orthographic",
              label: "Switch To Orthographic",
            },
            {
              icon: "grid",
              id: "perspective",
              label: "Switch To Perspective",
            },
          ],
          groupId: "camera_switcher",
          type: "toggle-button",
        },
      ],
    });
  }, []);

  useEffect(() => broadcastForwardedKeyboardEvents(), []);

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
    <SceneProvider value={files}>
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
              <SceneElement
                __component={Provider}
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
              </SceneElement>
              {fg("camera_axis_helper") ? (
                <CameraAxisHelper />
              ) : (
                <CameraGizmo />
              )}
            </Suspense>
          </ErrorBoundaryForScene>
          <TriplexGrid />
        </Camera>

        {fg("selection_postprocessing") && <PostProcessing />}
      </Canvas>
      <Tunnel.Out />
    </SceneProvider>
  );
}
