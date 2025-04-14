/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { compose, on, send } from "@triplex/bridge/host";

/**
 * Initializes a stub bridge for host <-> scene communication. Inside WebXR
 * there is no host as the scene is the top level document.
 */
export function initializeWebXRBridge() {
  return compose([
    on("element-preview-prop", (data) => {
      send("request-set-element-prop", data);
    }),
  ]);
}
