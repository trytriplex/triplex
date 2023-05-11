import { useEffect } from "react";
import { ContextPanel } from "./ui/context-panel";
import { EditorMenu } from "./ui/editor-menu";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { ControlsMenu } from "./ui/controls-menu";

export function EditorFrame() {
  const { path, save, undo, redo, deleteComponent } = useEditor();

  useEffect(() => {
    if (!path) {
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
    if (!path) {
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
        <EditorMenu />
        {path && <ScenePanel />}
      </div>

      <div className="z-10 mx-auto self-end">
        <ControlsMenu />
      </div>

      <div className="pointer-events-none z-10 flex overflow-hidden pr-3">
        <ContextPanel />
      </div>

      <ScenesDrawer />
    </>
  );
}
