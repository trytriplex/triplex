/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeyboardEvents,
  compose,
  on,
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { LoadingLogo } from "@triplex/lib/loader";
import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ErrorBoundaryForScene } from "../../components/error-boundary";
import { ErrorFallback } from "../../components/error-fallback";
import { Tunnel } from "../../components/tunnel";
import { SceneLoader } from "../scene-loader";
import { SwitchToComponentContext } from "./context";
import { DebugAttributes } from "./debug";
import { type Component } from "./types";

export function App({
  files,
  provider,
  providerPath,
}: {
  files: Modules;
  provider: ProviderComponent;
  providerPath: string;
}) {
  const [component, setComponent] = useState<Component>({
    exportName: "",
    path: "",
    props: {},
  });

  const switchToComponent = useCallback((component: Component) => {
    startTransition(() => {
      setComponent(component);
      send("component-opened", {
        encodedProps: JSON.stringify(component.props),
        entered: true,
        exportName: component.exportName,
        path: component.path,
      });
    });
  }, []);

  useEffect(() => {
    send("set-extension-points", {
      area: "elements",
      controls: [
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
    });
  }, []);

  useEffect(() => {
    send("ready", undefined);
    return compose([
      broadcastForwardedKeyboardEvents(),
      on("request-open-component", (sceneObject) => {
        if (!sceneObject) {
          return;
        }

        switchToComponent({
          exportName: sceneObject.exportName,
          path: sceneObject.path,
          props: sceneObject.encodedProps
            ? JSON.parse(sceneObject.encodedProps)
            : {},
        });
      }),
    ]);
  }, [switchToComponent]);

  return (
    <SwitchToComponentContext.Provider value={switchToComponent}>
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
        <Suspense
          fallback={
            <LoadingLogo
              color="rgb(59 130 246)"
              position="hint"
              variant="stroke"
            />
          }
        >
          <SceneLoader
            exportName={component.exportName}
            modules={files}
            path={component.path}
            provider={provider}
            providerPath={providerPath}
            sceneProps={component.props}
          />
        </Suspense>
        <Tunnel.Out />
        <DebugAttributes />
      </ErrorBoundaryForScene>
    </SwitchToComponentContext.Provider>
  );
}
