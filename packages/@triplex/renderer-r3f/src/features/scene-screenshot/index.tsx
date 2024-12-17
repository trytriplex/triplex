/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
