/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useContext, useEffect } from "react";
import { useSceneObjectEvents } from "../scene-element/use-scene-element-events";
import { ResetCountContext } from "../scene-loader/context";

export function ResolveSelection() {
  const { onSceneObjectCommitted } = useSceneObjectEvents();
  const resetCount = useContext(ResetCountContext);

  useEffect(() => {
    if (resetCount > 0) {
      onSceneObjectCommitted();
    }
  }, [onSceneObjectCommitted, resetCount]);

  return null;
}
