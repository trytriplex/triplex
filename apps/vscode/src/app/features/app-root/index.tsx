/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { cn } from "@triplex/lib";
import { useScreenView } from "@triplex/ux";
import { useEffect, useState } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { onVSCE } from "../../util/bridge";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";
import { EmptyState } from "./empty-state";
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
    <div className="fixed inset-0 flex select-none">
      <Events />
      <Panels />
      <div className="relative h-full w-full">
        <FloatingControls />
        <EmptyState />
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
  );
}

preloadSubscription("/scene/:path/:exportName", {
  exportName: window.triplex.initialState.exportName,
  path: window.triplex.initialState.path,
});
