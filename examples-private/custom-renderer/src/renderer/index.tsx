/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  init,
  type BootstrapFunction,
  type ThumbnailFunction,
} from "@triplex/bridge/client";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Renderer } from "./renderer";
import { RendererElement } from "./renderer-element";

init({ RendererElement });

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return (opts) => {
    root.render(
      <Renderer
        files={opts.files}
        provider={opts.provider}
        providerPath={opts.config.provider}
      />,
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
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          inset: 0,
          justifyContent: "center",
          position: "absolute",
          width: "100%",
        }}
      >
        <Ready>
          <ErrorBoundary fallbackRender={() => null}>
            <Provider>
              <Component />
            </Provider>
          </ErrorBoundary>
        </Ready>
      </div>,
    );
  };
};
