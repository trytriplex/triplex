/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas } from "@react-three/fiber";
import {
  type BootstrapFunction,
  type ThumbnailFunction,
} from "@triplex/bridge/client";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Bounds } from "triplex-drei";
import { Renderer } from "./renderer";
import { SceneObject } from "./scene-object";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return (opts) => {
    root.render(
      <Renderer
        files={opts.files}
        provider={opts.provider}
        providerPath={opts.config.provider}
      />
    );
  };
};

function Ready({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("screenshot!");
  }, []);

  return <>{children}</>;
}

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component: Component, provider: Provider }) => {
    root.render(
      <Canvas shadows style={{ inset: 0, position: "absolute" }}>
        <Ready>
          <ErrorBoundary fallbackRender={() => null}>
            <Bounds damping={0} fit>
              <Provider>
                <Component />
              </Provider>
            </Bounds>

            <ambientLight intensity={2} />
          </ErrorBoundary>
        </Ready>
      </Canvas>
    );
  };
};
