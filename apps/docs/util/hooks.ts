/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEffect, useState } from "react";

export function useVisibilityState() {
  const [visibilityState, setVisibilityState] = useState<"visible" | "hidden">(
    "visible",
  );

  useEffect(() => {
    const callback = () => {
      setVisibilityState(document.visibilityState);
    };

    document.addEventListener("visibilitychange", callback);

    return () => {
      document.removeEventListener("visibilitychange", callback);
    };
  }, []);

  return visibilityState;
}
