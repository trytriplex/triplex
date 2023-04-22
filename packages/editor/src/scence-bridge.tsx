import { listen, compose } from "@triplex/bridge/host";
import { ReactNode, useEffect, useState } from "react";
import { useEditor } from "./stores/editor";
import { useScene } from "./stores/scene";

export interface FocusedObject {
  line: number;
  column: number;
  ownerPath: string;
}

export function SceneFrame({ children }: { children: ReactNode }) {
  const editor = useEditor();
  const [initialPath] = useState(() => editor.path);
  const [initialProps] = useState(() => editor.encodedProps);
  const [initialExportName] = useState(() => editor.exportName);
  const sceneReady = useScene((prev) => prev.sceneReady);

  useEffect(() => {
    return listen("trplx:onConnected", sceneReady);
  }, [sceneReady]);

  return (
    <>
      <iframe
        // This should never change during a session as it will do a full page reload.
        src={`/scene.html?path=${initialPath}&props=${initialProps}&exportName=${initialExportName}`}
        className="absolute h-full w-full border-none"
      />
      <BridgeSendEvents />
      <BridgeReceiveEvents />
      {children}
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

    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        scene.blur();
      }

      if (e.key === "f") {
        scene.jumpTo();
      }

      if (e.key === "F" && e.shiftKey) {
        scene.navigateTo();
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, [scene]);

  useEffect(() => {
    if (!scene.ready) {
      return;
    }

    // This handles the browser history being updated and propagating to the scene.
    scene.navigateTo({
      path: editor.path,
      encodedProps: editor.encodedProps,
      exportName: editor.exportName,
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
      listen("trplx:onAddNewComponent", editor.addComponent),
      listen("trplx:requestDeleteSceneObject", editor.deleteComponent),
      listen("trplx:requestSave", editor.save),
      listen("trplx:requestUndo", editor.undo),
      listen("trplx:requestRedo", editor.redo),
      listen("trplx:onSceneObjectNavigated", (data) => {
        editor.set(
          {
            path: data.path,
            exportName: data.exportName,
            encodedProps: data.encodedProps,
          },
          { entered: data.entered }
        );
      }),
      listen("trplx:onConfirmSceneObjectProp", async (data) => {
        const currentPropValue = await scene.getPropValue(data);

        editor.persistPropValue({
          column: data.column,
          line: data.line,
          path: data.path,
          propName: data.propName,
          nextPropValue: data.propValue,
          currentPropValue: currentPropValue.value,
        });
      }),
      listen("trplx:onSceneObjectFocus", (data) => {
        editor.focus({
          column: data.column,
          line: data.line,
          ownerPath: editor.path,
        });
      }),
      listen("trplx:onSceneObjectBlur", () => {
        editor.focus(null);
      }),
    ]);
  }, [scene, editor]);

  return null;
}
