/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, send } from "@triplex/bridge/host";
import { useEffect } from "react";
import { onVSCE } from "../util/bridge";

export function App() {
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
    ]);
  }, []);

  return (
    <iframe
      allow="cross-origin-isolated"
      className="absolute inset-0 h-full w-full"
      src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
    />
  );
}
