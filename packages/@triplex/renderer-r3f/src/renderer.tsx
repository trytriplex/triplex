/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect } from "react";
import { SceneProvider } from "./context";
import { SceneFrame } from "./scene";

export function Renderer({
  files,
  provider,
  providerPath,
}: {
  files: Modules;
  provider: ProviderComponent;
  providerPath: string;
}) {
  useEffect(() => {
    send("set-element-actions", {
      actions: [
        {
          buttons: [
            {
              icon: "camera",
              id: "enter-camera",
              label: "Enter Camera",
            },
            {
              icon: "exit",
              id: "exit-camera",
              label: "Exit Camera",
            },
          ],
          filter: "Camera",
          id: "enter-camera",
          type: "toggle-button",
        },
      ],
    });

    send("set-controls", {
      controls: [
        {
          buttons: [
            {
              accelerator: "T",
              icon: "move",
              id: "translate",
              label: "Translate",
            },
            {
              accelerator: "R",
              icon: "angle",
              id: "rotate",
              label: "Rotate",
            },
            {
              accelerator: "S",
              icon: "transform",
              id: "scale",
              label: "Scale",
            },
          ],
          defaultSelected: "translate",
          id: "transform-controls",
          type: "button-group",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "grid-perspective",
              id: "orthographic",
              label: "Switch To Orthographic",
            },
            {
              icon: "grid",
              id: "perspective",
              label: "Switch To Perspective",
            },
          ],
          id: "camera-switcher",
          type: "toggle-button",
        },
      ],
    });
  }, []);

  return (
    <SceneProvider value={files}>
      <SceneFrame provider={provider} providerPath={providerPath} />
    </SceneProvider>
  );
}
