/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on } from "@triplex/bridge/host";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { useEffect, useState } from "react";
import { cn } from "./ds/cn";
import { Stage } from "./stage";
import { useEditor } from "./stores/editor";
import { useScene } from "./stores/scene";

export interface FocusedObject {
  column: number;
  line: number;
  path: string;
}

export function SceneFrame() {
  const sceneReady = useScene((prev) => prev.sceneReady);
  const [blockPointerEvents, setBlockPointerEvents] = useState(false);
  const navigateTo = useScene((store) => store.navigateTo);
  const editor = useEditor();
  const playState = useScene((store) => store.playState);

  useEffect(() => {
    return on("ready", () => {
      sceneReady();
      navigateTo({
        encodedProps: editor.encodedProps,
        exportName: editor.exportName,
        path: editor.path,
      });
    });
  }, [
    editor.encodedProps,
    editor.exportName,
    editor.path,
    navigateTo,
    sceneReady,
  ]);

  useEffect(() => {
    // This works around iframes underneath drag/drop areas from
    // blocking drag events completely breaking drag/drop experiences.
    // See: https://github.com/electron/electron/issues/18226
    const block = () => {
      setBlockPointerEvents(true);
    };
    const unblock = () => {
      setBlockPointerEvents(false);
    };

    window.addEventListener("dragstart", block);
    window.addEventListener("dragend", unblock);

    return () => {
      window.removeEventListener("dragstart", block);
      window.removeEventListener("dragend", unblock);
    };
  }, []);

  return (
    <div
      className={cn([
        "relative row-start-3 flex items-center justify-center overflow-hidden",
        playState === "play"
          ? "col-span-3 col-start-1"
          : "col-span-1 col-start-2",
      ])}
    >
      <Stage>
        <iframe
          // Needed for SharedBufferArray support.
          allow="cross-origin-isolated"
          className={cn([
            blockPointerEvents && "pointer-events-none",
            "h-full w-full flex-shrink-0 border-none",
          ])}
          id="scene"
          src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
        />
      </Stage>

      <BridgeSendEvents />
      <BridgeReceiveEvents />
    </div>
  );
}

function BridgeSendEvents() {
  const navigateTo = useScene((store) => store.navigateTo);
  const ready = useScene((store) => store.ready);
  const editor = useEditor();

  useEffect(() => {
    if (!ready) {
      return;
    }

    // This handles the browser history being updated and propagating to the scene.
    navigateTo({
      encodedProps: editor.encodedProps,
      exportName: editor.exportName,
      path: editor.path,
    });
  }, [editor.encodedProps, editor.exportName, editor.path, navigateTo, ready]);

  return null;
}

function BridgeReceiveEvents() {
  const editor = useEditor();
  const ready = useScene((store) => store.ready);
  const telemetry = useTelemetry();

  useEffect(() => {
    if (!ready) {
      return;
    }

    return compose([
      on("track", (data) => {
        telemetry.event(`scene_${data.actionId}` as ActionId);
      }),
      on("component-opened", (data) => {
        editor.set(
          {
            encodedProps: data.encodedProps,
            exportName: data.exportName,
            path: data.path,
          },
          data.entered ? { entered: true } : undefined
        );
      }),
      on("element-set-prop", (data) => {
        editor.persistPropValue({
          column: data.column,
          line: data.line,
          path: data.path,
          propName: data.propName,
          propValue: data.propValue,
        });
      }),
      on("element-focused", (data) => {
        editor.focus(data);
      }),
      on("element-blurred", () => {
        editor.focus(null);
      }),
    ]);
  }, [telemetry, editor, ready]);

  return null;
}
