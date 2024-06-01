/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeydownEvents,
  compose,
  on,
  send,
} from "@triplex/bridge/host";
import { useScreenView } from "@triplex/ux";
import { useEffect } from "react";
import { onVSCE } from "../util/bridge";
import { ContextPanel } from "./context-panel";
import { Controls } from "./controls";

export function App() {
  useScreenView("app", "Panel");

  useEffect(() => {
    return compose([
      on("ready", () => {
        send("request-open-component", {
          encodedProps: "",
          exportName: window.triplex.initialState.exportName,
          path: window.triplex.initialState.path,
        });
      }),
      onVSCE("vscode:request-open-component", (data) => {
        send("request-open-component", {
          encodedProps: "",
          exportName: data.exportName,
          path: data.path,
        });
      }),
      broadcastForwardedKeydownEvents(),
    ]);
  }, []);

  return (
    <>
      <ContextPanel />
      <Controls />
      <iframe
        allow="cross-origin-isolated"
        className="absolute inset-0 h-full w-full"
        id="scene"
        src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
      />
    </>
  );
}
