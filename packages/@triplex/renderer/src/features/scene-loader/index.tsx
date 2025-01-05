/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  compose,
  on,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect, useMemo, useReducer } from "react";
import { Canvas } from "../canvas";
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
    return compose([
      on("request-refresh-scene", () => {
        incrementReset();
      }),
      on("request-state-change", ({ state }) => {
        if (state === "edit") {
          incrementReset();
        }
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
            <ReactDOMSelection filter={{ exportName, path }}>
              <SceneRenderer
                component={scene.component}
                exportName={exportName}
                path={path}
                props={sceneProps}
              />
            </ReactDOMSelection>
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
        </SceneContext.Provider>
      </ResetCountContext.Provider>
    </SelectionProvider>
  );
}
