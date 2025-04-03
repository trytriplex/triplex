/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { XR, type XRStore } from "@react-three/xr";
import { type Modules, type ProviderModule } from "@triplex/bridge/client";
import { useMemo } from "react";
import { Canvas } from "../canvas";
import { SceneControls } from "../scene-controls";
import { SceneElement } from "../scene-element";
import { SceneRenderer } from "../scene-renderer";
import { SelectionProvider } from "../selection-provider";
import { SceneContext } from "./context";
import { type LoadedSceneContext } from "./types";
import { useSceneLoader } from "./use-scene-loader";

export function WebXRSceneLoader({
  exportName,
  modules,
  path,
  providerPath,
  providers,
  sceneProps,
  store,
}: {
  exportName: string;
  modules: Modules;
  path: string;
  providerPath: string;
  providers: ProviderModule;
  sceneProps?: Record<string, unknown>;
  store: XRStore;
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
            providerPath,
            providers,
            scene: scene.component,
          }
        : null,
    [exportName, path, providerPath, providers, scene],
  );

  if (!scene) {
    return null;
  }

  if (scene.meta.root === "react") {
    return <div>Only 3D components are supported in WebXR.</div>;
  }

  return (
    <SelectionProvider>
      <SceneContext.Provider value={sceneContext}>
        <SceneElement
          __component={providers.GlobalProvider}
          __meta={{
            column: -888,
            exportName: "GlobalProvider",
            line: -888,
            name: "GlobalProvider",
            path: providerPath,
            rotate: false,
            scale: false,
            translate: false,
          }}
          forceInsideSceneObjectContext
        >
          <Canvas>
            <XR store={store}>
              <SceneRenderer
                component={scene.component}
                exportName={exportName}
                path={path}
                props={sceneProps}
              />
            </XR>
          </Canvas>
          <SceneControls />
        </SceneElement>
      </SceneContext.Provider>
    </SelectionProvider>
  );
}
