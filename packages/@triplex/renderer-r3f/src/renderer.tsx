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
import { BrowserRouter } from "react-router-dom";
import { SceneProvider } from "./context";
import { Environment } from "./environment";
import { SceneFrame } from "./scene";

export function Renderer({
  files,
  provider,
}: {
  files: Modules;
  provider: ProviderComponent;
}) {
  useEffect(() => {
    send("connected", undefined);

    send("set-element-actions", {
      actions: [
        {
          buttons: [
            {
              icon: "camera",
              id: "enter-camera",
              label: "Enter camera",
            },
            {
              icon: "exit",
              id: "exit-camera",
              label: "Exit camera",
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
              label: "Switch to orthographic",
            },
            {
              icon: "grid",
              id: "perspective",
              label: "Switch to perspective",
            },
          ],
          id: "camera-switcher",
          type: "toggle-button",
        },
      ],
    });
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
