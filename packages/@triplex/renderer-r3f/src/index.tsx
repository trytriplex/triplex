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
import { initFeatureGates } from "@triplex/lib/fg";
import { createRoot } from "react-dom/client";
import { App } from "./features/app";
import { SceneElement } from "./features/scene-element";
import { SceneScreenshot } from "./features/scene-screenshot";

init({ RendererElement: SceneElement });

export { Canvas } from "./features/canvas";

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return async (opts) => {
    await initFeatureGates({
      environment: opts.fgEnvironmentOverride,
      userId: opts.userId,
    });

    root.render(
      <App
        files={opts.files}
        provider={opts.provider}
        providerPath={opts.config.provider}
      />,
    );
  };
};

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component, provider }) => {
    root.render(<SceneScreenshot component={component} provider={provider} />);
  };
};
