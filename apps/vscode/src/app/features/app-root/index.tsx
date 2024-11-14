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
  cn,
  draggableNumberInputContextMenuFix,
  onKeyDown,
  useBlockInputPropagation,
} from "@triplex/lib";
import { useScreenView, useTelemetry, type ActionId } from "@triplex/ux";
import { useEffect, useState } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { useInitSceneSync, useSceneStore } from "../../stores/scene";
import { forwardClientMessages, onVSCE, sendVSCE } from "../../util/bridge";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";

function Events() {
  const selected = useSceneStore((store) => store.selected);
  const telemetry = useTelemetry();

  useEffect(() => {
    return compose([
      forwardKeyboardEvents(),
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
      onKeyDown("Escape", () => {
        send("request-blur-element", undefined);
        telemetry.event("contextmenu_element_blur");
      }),
      onVSCE("vscode:request-jump-to-element", (data) => {
        const target = data || selected;
        if (target && "exportName" in target) {
          return;
        }

        send("request-jump-to-element", target);
        telemetry.event("contextmenu_element_jumpto");
      }),
    ]);
  }, [selected, telemetry]);

  return null;
}

export function AppRoot() {
  const initSync = useInitSceneSync();
  const syncContext = useSceneStore((store) => store.syncContext);
  const telemetry = useTelemetry();
  const [blockClicks, setBlockClicks] = useState(false);

  useScreenView("app", "Screen");
  useBlockInputPropagation();

  useEffect(() => {
    return compose([
      initSync(),
      draggableNumberInputContextMenuFix(),
      on("track", (data) => {
        telemetry.event(`scene_${data.actionId}` as ActionId);
      }),
      on("component-opened", (data) => {
        preloadSubscription("/scene/:path/:exportName/props", data);
        syncContext({
          exportName: data.exportName,
          path: data.path,
        });
      }),
      forwardClientMessages("element-set-prop"),
      forwardClientMessages("error"),
      onVSCE("vscode:state-change", (data) => {
        setBlockClicks(!data.active);
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
      broadcastForwardedKeyboardEvents(),
    ]);
  }, [initSync, syncContext, telemetry]);

  return (
    <div className="fixed inset-0 flex select-none">
      <Events />
      <Panels />
      <div className="relative h-full w-full">
        <FloatingControls />
        <iframe
          allow="cross-origin-isolated"
          className={cn([
            "h-full w-full",
            blockClicks && "pointer-events-none",
          ])}
          id="scene"
          src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
        />
      </div>
    </div>
  );
}
