/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useScreenView } from "@triplex/ux";
import { preloadSubscription } from "../../hooks/ws";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";
import { Dialogs } from "./dialogs";
import { EmptyState } from "./empty-state";
import { Events } from "./events";

export function AppRoot() {
  useScreenView("app", "Screen");

  return (
    <div className="fixed inset-0 flex select-none">
      <Events />
      <Panels />
      <Dialogs />
      <div className="relative h-full w-full">
        <FloatingControls />
        <EmptyState />
        <iframe
          allow="cross-origin-isolated"
          className="h-full w-full"
          data-testid="scene"
          id="scene"
          src={`http://localhost:${window.triplex.env.ports.client}/scene`}
        />
      </div>
    </div>
  );
}

preloadSubscription("/scene/:path/:exportName", {
  exportName: window.triplex.initialState.exportName,
  path: window.triplex.initialState.path,
});
