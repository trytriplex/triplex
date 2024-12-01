/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
