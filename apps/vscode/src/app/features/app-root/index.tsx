/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { cn } from "@triplex/lib";
import { useScreenView } from "@triplex/ux";
import { useEffect, useState } from "react";
import { onVSCE } from "../../util/bridge";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";
import { SceneContextProvider } from "./context";
import { Events } from "./events";

export function AppRoot() {
  const [blockClicks, setBlockClicks] = useState(false);
  useScreenView("app", "Screen");

  useEffect(() => {
    return onVSCE("vscode:state-change", (data) => {
      setBlockClicks(!data.active);
    });
  }, []);

  return (
    <SceneContextProvider>
      <div className="fixed inset-0 flex select-none">
        <Events />
        <Panels />
        <div className="relative h-full w-full">
          <FloatingControls />
          <iframe
            allow="cross-origin-isolated"
            className={cn([
              "h-full w-full",
              blockClicks && "pointer-events-none",
            ])}
            data-testid="scene"
            id="scene"
            src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
          />
        </div>
      </div>
    </SceneContextProvider>
  );
}
