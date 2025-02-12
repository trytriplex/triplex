/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Canvas } from "@react-three/fiber";
import {
  type ProviderComponent,
  type SceneComponent,
} from "@triplex/bridge/client";
import { Suspense, useEffect } from "react";
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
  provider: Provider,
}: {
  component: SceneComponent;
  provider: ProviderComponent;
}) {
  return (
    <Suspense>
      <Ready />
      {component.triplexMeta.root === "react" && (
        <Provider>
          <SceneRenderer
            component={component}
            exportName="default"
            path=""
            props={{}}
          />
        </Provider>
      )}
      {component.triplexMeta.root === "react-three-fiber" && (
        <Canvas shadows style={{ inset: 0, position: "absolute" }}>
          <Provider>
            <SceneRenderer
              component={component}
              exportName="default"
              path=""
              props={{}}
            />
          </Provider>
        </Canvas>
      )}
    </Suspense>
  );
}
