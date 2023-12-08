/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  send,
  type BootstrapFunction,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SceneProvider } from "./context";
import { Environment } from "./environment";
import { SceneFrame } from "./scene";
import { SceneObject } from "./scene-object";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export function Scene({
  files,
  provider,
}: {
  files: Modules;
  provider: ProviderComponent;
}) {
  useEffect(() => {
    send("trplx:onConnected", undefined);
  }, []);

  return (
    <BrowserRouter>
      <SceneProvider value={files}>
        <Environment>
          <SceneFrame provider={provider} />
        </Environment>
      </SceneProvider>
    </BrowserRouter>
  );
}

export const bootstrap: BootstrapFunction = (container) => {
  const root = createRoot(container);

  return (opts) => {
    root.render(<Scene files={opts.files} provider={opts.provider} />);
  };
};
