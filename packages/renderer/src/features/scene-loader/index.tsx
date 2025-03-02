/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  compose,
  on,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect, useMemo, useReducer } from "react";
import { DefaultCameraContext } from "../camera-new/context";
import { Canvas } from "../canvas";
import { SceneControls } from "../scene-controls";
import { SceneRenderer } from "../scene-renderer";
import { SelectionProvider } from "../selection-provider";
import { ReactDOMSelection } from "../selection-react-dom";
import { ResetCountContext, SceneContext } from "./context";
import { type LoadedSceneContext } from "./types";
import { useSceneLoader } from "./use-scene-loader";

export function SceneLoader({
  exportName,
  modules,
  path,
  provider,
  providerPath,
  sceneProps,
}: {
  exportName: string;
  modules: Modules;
  path: string;
  provider: ProviderComponent;
  providerPath: string;
  sceneProps: Record<string, unknown>;
}) {
  const [resetCount, incrementReset] = useReducer(
    (count: number) => count + 1,
    0,
  );

  const scene = useSceneLoader({
    exportName,
    modules,
    path,
  });

  const sceneContext: LoadedSceneContext | null = useMemo(
    () =>
      scene
        ? {
            exportName,
            meta: scene.meta,
            path,
            provider,
            providerPath,
            scene: scene.component,
          }
        : null,
    [exportName, path, provider, providerPath, scene],
  );

  useEffect(() => {
    let previousState: "play" | "pause" | "edit" = "edit";

    return compose([
      on("request-refresh-scene", () => {
        incrementReset();
      }),
      on("request-state-change", ({ state }) => {
        if (state === "edit" && previousState !== "edit") {
          incrementReset();
        }

        previousState = state;
      }),
    ]);
  }, []);

  if (!scene) {
    return null;
  }

  return (
    <SelectionProvider>
      <ResetCountContext.Provider value={resetCount}>
        <SceneContext.Provider value={sceneContext}>
          {scene.meta.root === "react" && (
            <DefaultCameraContext.Provider value="default">
              <ReactDOMSelection filter={{ exportName, path }}>
                <SceneRenderer
                  component={scene.component}
                  exportName={exportName}
                  path={path}
                  props={sceneProps}
                />
              </ReactDOMSelection>
            </DefaultCameraContext.Provider>
          )}
          {scene.meta.root === "react-three-fiber" && (
            <Canvas>
              <SceneRenderer
                component={scene.component}
                exportName={exportName}
                path={path}
                props={sceneProps}
              />
            </Canvas>
          )}
          <SceneControls />
        </SceneContext.Provider>
      </ResetCountContext.Provider>
    </SelectionProvider>
  );
}
