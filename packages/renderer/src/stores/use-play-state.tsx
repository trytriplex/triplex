/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on } from "@triplex/bridge/client";
import { useEffect, useState } from "react";

export function usePlayState() {
  const [playState, setPlayState] = useState<"edit" | "play" | "pause">("edit");

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      setPlayState(state);
    });
  }, []);

  return playState;
}
