/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
