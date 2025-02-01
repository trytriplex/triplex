/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
