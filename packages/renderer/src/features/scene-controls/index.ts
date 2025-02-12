/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { useCanvasMounted } from "../canvas/store";
import * as react from "./controls-react";
import * as threeFiber from "./controls-three-fiber";

export function SceneControls() {
  const isCanvasMounted = useCanvasMounted((state) => state.mounted);

  useEffect(() => {
    const setExtensionPoints = () => {
      if (isCanvasMounted) {
        send("set-extension-points", {
          area: "scene",
          controls: react.controls.concat(threeFiber.controls),
        });
        send("set-extension-points", {
          area: "settings",
          options: react.settings.concat(threeFiber.settings),
        });
      } else {
        send("set-extension-points", {
          area: "scene",
          controls: react.controls,
        });
        send("set-extension-points", {
          area: "settings",
          options: react.settings,
        });
      }
    };

    if (isCanvasMounted === undefined) {
      // Defer a moment to let both reconcilers mount.
      const timeoutId = setTimeout(setExtensionPoints, 50);
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Immediately set extension points.
      setExtensionPoints();
    }
  }, [isCanvasMounted]);

  return null;
}
