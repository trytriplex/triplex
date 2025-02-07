/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
