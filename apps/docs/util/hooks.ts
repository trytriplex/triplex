/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
