/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on, send } from "@triplex/bridge/host";
import { useEffect } from "react";
import { useLazySubscription } from "../hooks/ws";

export function App() {
  const scene = useLazySubscription("/scene");

  useEffect(() => {
    return on("ready", () => {
      const { path } = scene.scenes[0];
      const { exportName } = scene.scenes[0].exports[0];
      send("request-open-component", { encodedProps: "", exportName, path });
    });
  }, [scene.scenes]);

  return (
    <iframe
      allow="cross-origin-isolated"
      className="absolute inset-0 h-full w-full"
      src={`http://localhost:3333/scene.html`}
    />
  );
}
