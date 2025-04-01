/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
        providerPath={opts.config.provider}
        providers={opts.providers}
      />,
    );
  };
};

export const bootstrapWebXR: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return async (opts) => {
    await initFeatureGates({
      environment: opts.fgEnvironmentOverride,
      userId: opts.userId,
    });

    root.render(<div>WebXR goes brrr</div>);
  };
};

export const thumbnail: ThumbnailFunction = (container) => {
  const root = createRoot(container);

  return ({ component, providers }) => {
    root.render(
      <SceneScreenshot component={component} providers={providers} />,
    );
  };
};
