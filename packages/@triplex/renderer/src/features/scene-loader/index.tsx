/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Modules, type ProviderComponent } from "@triplex/bridge/client";
import { useMemo } from "react";
import { Canvas } from "../canvas";
import { SceneRenderer } from "../scene-renderer";
import { SelectionProvider } from "../selection-provider";
import { ReactDOMSelection } from "../selection-react-dom";
import { SceneContext } from "./context";
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

  if (!scene) {
    return null;
  }

  return (
    <SelectionProvider>
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
    </SelectionProvider>
  );
}
