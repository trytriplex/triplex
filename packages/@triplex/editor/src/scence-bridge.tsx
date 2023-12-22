/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { cn } from "./ds/cn";
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
    <>
      <iframe
        // This should never change during a session as it will do a full page reload.
        className={cn([
          "col-span-full row-start-3 h-full w-full border-none",
          blockPointerEvents && "pointer-events-none",
        ])}
        src={`http://localhost:${window.triplex.env.ports.client}/scene.html`}
      />
      <BridgeSendEvents />
      <BridgeReceiveEvents />
    </>
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

  useEffect(() => {
    if (!ready) {
      return;
    }

    return compose([
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
  }, [editor, ready]);

  return null;
}
