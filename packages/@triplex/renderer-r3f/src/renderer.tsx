/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeyboardEvents,
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect } from "react";
import { Tunnel } from "./components/tunnel";
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
    send("set-extension-points", {
      elements: [
        {
          buttons: [
            {
              icon: "camera",
              id: "camera_enter",
              label: "Enter Camera",
            },
            {
              icon: "exit",
              id: "camera_exit",
              label: "Exit Camera",
            },
          ],
          filter: "PerspectiveCamera|OrthographicCamera",
          groupId: "enter_camera",
          type: "toggle-button",
        },
      ],
      scene: [
        {
          buttons: [
            {
              icon: "world",
              id: "transformlocal",
              label: "Set Local Transform",
            },
            {
              icon: "local",
              id: "transformworld",
              label: "Set World Transform",
            },
          ],
          groupId: "transform_space",
          type: "toggle-button",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "cursor",
              id: "none",
              label: "Select",
            },
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
          defaultSelected: "none",
          groupId: "transform_controls",
          type: "button-group",
        },
        {
          type: "separator",
        },
        {
          buttons: [
            {
              icon: "moon",
              id: "default_lights_on",
              label: "Turn On Default Lights",
            },
            {
              icon: "sun",
              id: "default_lights_off",
              label: "Turn Off Default Lights",
            },
          ],
          groupId: "lights",
          type: "toggle-button",
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
          groupId: "camera_switcher",
          type: "toggle-button",
        },
      ],
    });
  }, []);

  useEffect(() => broadcastForwardedKeyboardEvents(), []);

  return (
    <SceneProvider value={files}>
      <SceneFrame provider={provider} providerPath={providerPath} />
      <Tunnel.Out />
    </SceneProvider>
  );
}
