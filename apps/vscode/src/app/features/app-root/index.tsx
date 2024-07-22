/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  broadcastForwardedKeydownEvents,
  compose,
  on,
  send,
} from "@triplex/bridge/host";
import { onKeyDown } from "@triplex/lib";
import { useScreenView, useTelemetry, type ActionId } from "@triplex/ux";
import { useEffect } from "react";
import { useInitSceneSync, useSceneStore } from "../../stores/scene";
import { forwardClientMessages, onVSCE, sendVSCE } from "../../util/bridge";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";

function Events() {
  const selected = useSceneStore((store) => store.selected);

  useEffect(() => {
    return compose([
      onVSCE("vscode:request-delete-element", (data) => {
        const target = data || selected;
        if (target) {
          send("request-delete-element", target);
          sendVSCE("element-delete", target);
        }
      }),
      onVSCE("vscode:request-duplicate-element", (data) => {
        const target = data || selected;
        if (target) {
          sendVSCE("element-duplicate", target);
        }
      }),
      onKeyDown("Escape", () => {
        send("request-blur-element", undefined);
      }),
      onKeyDown("F", () => {
        send("request-jump-to-element", undefined);
      }),
    ]);
  }, [selected]);

  return null;
}

export function AppRoot() {
  const initSync = useInitSceneSync();
  const syncContext = useSceneStore((store) => store.syncContext);
  const telemetry = useTelemetry();

  useScreenView("app", "Panel");

  useEffect(() => {
    return compose([
      initSync(),
      on("track", (data) => {
        telemetry.event(`scene_${data.actionId}` as ActionId);
      }),
      on("component-opened", (data) => {
        syncContext({
          exportName: data.exportName,
          path: data.path,
        });
      }),
      forwardClientMessages("element-set-prop"),
      forwardClientMessages("error"),
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
      broadcastForwardedKeydownEvents(),
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
          className="h-full w-full"
          id="scene"
          src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
        />
      </div>
    </div>
  );
}
