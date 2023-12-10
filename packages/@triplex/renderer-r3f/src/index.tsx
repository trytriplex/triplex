/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type BootstrapFunction } from "@triplex/bridge/client";
import { createRoot } from "react-dom/client";
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
