/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, listen } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { useEnvironment } from "./environment";
import { useEditor } from "./stores/editor";
import { useScene } from "./stores/scene";
import { useUndoRedoState } from "./stores/undo-redo";

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

  useEffect(() => {
    return listen("trplx:onConnected", sceneReady);
  }, [sceneReady]);

  return (
    <>
      <iframe
        // This should never change during a session as it will do a full page reload.
        className="absolute h-full w-full border-none"
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
  const undo = useUndoRedoState((store) => store.undo);
  const redo = useUndoRedoState((store) => store.redo);

  useEffect(() => {
    if (!scene.ready) {
      return;
    }

    return compose([
      listen("trplx:onAddNewComponent", editor.addComponent),
      listen("trplx:requestDeleteSceneObject", editor.deleteComponent),
      listen("trplx:requestSave", editor.save),
      listen("trplx:requestUndo", undo),
      listen("trplx:requestRedo", redo),
      listen("trplx:onSceneObjectNavigated", (data) => {
        editor.set(
          {
            encodedProps: data.encodedProps,
            exportName: data.exportName,
            path: data.path,
          },
          data.entered ? { entered: true } : undefined
        );
      }),
      listen("trplx:onConfirmSceneObjectProp", async (data) => {
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
      listen("trplx:onSceneObjectFocus", (data) => {
        editor.focus(data);
      }),
      listen("trplx:onSceneObjectBlur", () => {
        editor.focus(null);
      }),
    ]);
  }, [scene, editor, undo, redo]);

  return null;
}
