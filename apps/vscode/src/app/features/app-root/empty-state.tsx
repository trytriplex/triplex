/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { TriplexLogo } from "@triplex/ux";
import { useSubscription } from "../../hooks/ws";
import { useSceneContext } from "./context";

export function EmptyState() {
  const context = useSceneContext();
  const elements = useSubscription("/scene/:path/:exportName", {
    exportName: context.exportName,
    path: context.path,
  });

  if (elements.sceneObjects.length > 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[-1] flex flex-col items-center justify-center gap-2 overflow-hidden">
      <div className="w-36 flex-shrink-0 opacity-5">
        <TriplexLogo />
      </div>
    </div>
  );
}
