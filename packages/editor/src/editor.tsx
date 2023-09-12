/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect } from "react";
import { ContextPanel } from "./ui/context-panel";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { ControlsMenu } from "./ui/controls-menu";
import { useUndoRedoState } from "./stores/undo-redo";
import { AssetsDrawer } from "./ui/assets-drawer";

export function EditorFrame() {
  const undo = useUndoRedoState((store) => store.undo);
  const redo = useUndoRedoState((store) => store.redo);
  const { path, save, deleteComponent } = useEditor();

  useEffect(() => {
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the editor and consolidate it
      // To one location where appropriate (e.g. menubar for menubar).
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.keyCode === 83 &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        save();
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [path, save]);

  useEffect(() => {
    if (!path || __TRIPLEX_TARGET__ === "electron") {
      // When in electron all shortcuts are handled by accelerators meaning
      // We don't need to set any hotkeys in app. We need to refactor this and
      // We need to clean up hotkey usage across the editor and consolidate it
      // To one location where appropriate (e.g. menubar for menubar).
      return;
    }

    const callback = (e: KeyboardEvent) => {
      if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.shiftKey
      ) {
        redo();
      } else if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        undo();
      } else if (
        e.key === "Backspace" &&
        // Ignore if we're focused inside an input.
        document.activeElement?.tagName !== "INPUT"
      ) {
        deleteComponent();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [deleteComponent, path, redo, save, undo]);

  return (
    <>
      <SceneFrame />

      <div className="z-10 row-auto flex flex-col gap-3 overflow-hidden pl-3">
        {path && <ScenePanel />}
      </div>

      <div className="z-10 mx-auto self-end">
        <ControlsMenu />
      </div>

      <div className="pointer-events-none z-10 flex overflow-hidden pr-3">
        <ContextPanel />
      </div>

      <ScenesDrawer />
      <AssetsDrawer />
    </>
  );
}
