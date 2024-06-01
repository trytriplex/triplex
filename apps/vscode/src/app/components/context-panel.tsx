/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, send } from "@triplex/bridge/host";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { useEffect } from "react";
import { forwardClientMessages } from "../util/bridge";
import { onKeyDown } from "../util/keyboard";

export function ContextPanel() {
  const telemetry = useTelemetry();

  useEffect(() => {
    return compose([
      onKeyDown("Escape", () => {
        send("request-blur-element", undefined);
      }),
      onKeyDown("f", () => {
        send("request-jump-to-element", undefined);
      }),
      on("track", (data) => {
        telemetry.event(`scene_${data.actionId}` as ActionId);
      }),
      forwardClientMessages("element-set-prop"),
    ]);
  }, [telemetry]);

  return null;
}
