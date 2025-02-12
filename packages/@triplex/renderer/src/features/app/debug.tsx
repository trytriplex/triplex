/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEffect, version } from "react";

/**
 * This component adds debug information to the renderer HTML that can be used
 * for automated tests / debugging.
 */
export function DebugAttributes() {
  useEffect(() => {
    document.documentElement.setAttribute("data-react", version);
  });

  return null;
}
