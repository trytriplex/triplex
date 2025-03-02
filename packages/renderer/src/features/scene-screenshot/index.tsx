/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  type ProviderModule,
  type SceneComponent,
} from "@triplex/bridge/client";
import { Suspense, useEffect } from "react";
import { Canvas } from "../canvas";
import { SceneRenderer } from "../scene-renderer";

function Ready() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("screenshot!");
  }, []);

  return null;
}

export function SceneScreenshot({
  component,
  providers,
}: {
  component: SceneComponent;
  providers: ProviderModule;
}) {
  return (
    <Suspense>
      <Ready />
      {component.triplexMeta.root === "react" && (
        <providers.GlobalProvider>
          <SceneRenderer
            component={component}
            exportName="default"
            path=""
            props={{}}
          />
        </providers.GlobalProvider>
      )}
      {component.triplexMeta.root === "react-three-fiber" && (
        <providers.GlobalProvider>
          <Canvas shadows style={{ inset: 0, position: "absolute" }}>
            <SceneRenderer
              component={component}
              exportName="default"
              path=""
              props={{}}
            />
          </Canvas>
        </providers.GlobalProvider>
      )}
    </Suspense>
  );
}
