/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
import { startTransition, useEffect } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { forwardClientMessages, onVSCE, sendVSCE } from "../../util/bridge";
import { useSceneEvents, useSceneSelected } from "../app-root/context";

export function Events() {
  const selected = useSceneSelected();
  const { syncContext } = useSceneEvents();
  const telemetry = useTelemetry();

  useEffect(() => {
    return compose([
      blockInputPropagation(),
      broadcastForwardedKeyboardEvents(),
      draggableNumberInputContextMenuFix(),
      forwardClientMessages("element-set-prop"),
      forwardClientMessages("error"),
      forwardKeyboardEvents(),
      on("element-preview-prop", (data) => {
        send("request-set-element-prop", data);
      }),
      on("component-opened", (data) => {
        preloadSubscription("/scene/:path/:exportName/props", data);

        startTransition(() => {
          syncContext({
            exportName: data.exportName,
            path: data.path,
          });
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
      onVSCE("vscode:request-group-elements", (data) => {
        const target = data || selected;
        if (!target) {
          return;
        }

        sendVSCE("element-group", [
          {
            astPath: target.astPath,
            column: target.column,
            line: target.line,
            path: target.path,
          },
        ]);
        telemetry.event("contextmenu_element_group");
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
  }, [selected, syncContext, telemetry]);

  return null;
}
