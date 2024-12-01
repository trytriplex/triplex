/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeyboardEvents,
  compose,
  forwardKeyboardEvents,
  on,
  send,
} from "@triplex/bridge/host";
import {
  blockInputPropagation,
  draggableNumberInputContextMenuFix,
  onKeyDown,
} from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { useEffect } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { useInitSceneSync, useSceneStore } from "../../stores/scene";
import { forwardClientMessages, onVSCE, sendVSCE } from "../../util/bridge";

export function Events() {
  const initSync = useInitSceneSync();
  const selected = useSceneStore((store) => store.selected);
  const syncContext = useSceneStore((store) => store.syncContext);
  const telemetry = useTelemetry();

  useEffect(() => {
    return compose([
      blockInputPropagation(),
      broadcastForwardedKeyboardEvents(),
      draggableNumberInputContextMenuFix(),
      forwardClientMessages("element-set-prop"),
      forwardClientMessages("error"),
      forwardKeyboardEvents(),
      initSync(),
      on("component-opened", (data) => {
        preloadSubscription("/scene/:path/:exportName/props", data);
        syncContext({
          exportName: data.exportName,
          path: data.path,
        });
      }),
      onVSCE("vscode:request-open-component", (data) => {
        send("request-open-component", {
          encodedProps: "",
          exportName: data.exportName,
          path: data.path,
        });
      }),
      onVSCE("vscode:request-blur-element", () => {
        send("request-blur-element", undefined);
      }),
      onVSCE("vscode:request-delete-element", (data) => {
        const target = data || selected;
        if (!target || "exportName" in target) {
          return;
        }

        send("request-delete-element", target);
        sendVSCE("element-delete", target);
        telemetry.event("contextmenu_element_delete");
      }),
      onVSCE("vscode:request-duplicate-element", (data) => {
        const target = data || selected;
        if (!target || "exportName" in target) {
          return;
        }

        sendVSCE("element-duplicate", target);
        telemetry.event("contextmenu_element_duplicate");
      }),
      onVSCE("vscode:request-focus-element", (target) => {
        send("request-focus-element", {
          ...target,
          parentPath: target.path,
        });
      }),
      onKeyDown("Escape", () => {
        send("request-blur-element", undefined);
        telemetry.event("contextmenu_element_blur");
      }),
      onVSCE("vscode:request-refresh-scene", () => {
        send("request-refresh-scene", undefined);
        telemetry.event("scene_frame_refresh_soft");
      }),
      onVSCE("vscode:request-reload-scene", () => {
        send("request-refresh-scene", { hard: true });
        telemetry.event("scene_frame_refresh_hard");
      }),
      onVSCE("vscode:request-jump-to-element", (data) => {
        const target = data || selected;
        if (target && "exportName" in target) {
          return;
        }

        send("request-jump-to-element", target);
        telemetry.event("contextmenu_element_jumpto");
      }),
      on("track", (data) => {
        telemetry.event(`scene_${data.actionId}` as ActionId);
      }),
    ]);
  }, [initSync, selected, syncContext, telemetry]);

  return null;
}
