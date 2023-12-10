/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { cn } from "./ds/cn";
import { useEnvironment } from "./environment";
import { useEditor } from "./stores/editor";
import { useScene } from "./stores/scene";

export interface FocusedObject {
  column: number;
  line: number;
  path: string;
}

export function SceneFrame() {
  const editor = useEditor();
  const [initialPath] = useState(() => editor.path);
  const [initialProps] = useState(() => editor.encodedProps);
  const [initialExportName] = useState(() => editor.exportName);
  const sceneReady = useScene((prev) => prev.sceneReady);
  const env = useEnvironment();
  const [blockPointerEvents, setBlockPointerEvents] = useState(false);

  useEffect(() => {
    return on("connected", sceneReady);
  }, [sceneReady]);

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
        src={`http://localhost:3333/scene.html?path=${initialPath}&props=${initialProps}&exportName=${initialExportName}&env=${encodeURIComponent(
          JSON.stringify(env)
        )}`}
      />
      <BridgeSendEvents />
      <BridgeReceiveEvents />
    </>
  );
}

function BridgeSendEvents() {
  const scene = useScene();
  const editor = useEditor();

  useEffect(() => {
    if (!scene.ready) {
      return;
    }

    // This handles the browser history being updated and propagating to the scene.
    scene.navigateTo({
      encodedProps: editor.encodedProps,
      exportName: editor.exportName,
      path: editor.path,
    });
  }, [editor.encodedProps, editor.exportName, editor.path, scene]);

  return null;
}

function BridgeReceiveEvents() {
  const editor = useEditor();
  const scene = useScene();

  useEffect(() => {
    if (!scene.ready) {
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
      on("element-set-prop", async (data) => {
        const currentPropValue = await scene.getPropValue(data);

        editor.persistPropValue({
          column: data.column,
          currentPropValue: currentPropValue.value,
          line: data.line,
          nextPropValue: data.propValue,
          path: data.path,
          propName: data.propName,
        });
      }),
      on("element-focused", (data) => {
        editor.focus(data);
      }),
      on("element-blurred", () => {
        editor.focus(null);
      }),
    ]);
  }, [scene, editor]);

  return null;
}
