import { useEffect } from "react";
import { ContextPanel } from "./ui/context-panel";
import { EditorMenu } from "./ui/editor-menu";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { ControlsMenu } from "./ui/controls-menu";
import { useSubscriptionEffect } from "@triplex/ws-client";

export function EditorFrame() {
  const { path, save, undo, redo, deleteComponent } = useEditor();
  const file = useSubscriptionEffect<{ isSaved: boolean }>(
    `/scene/${encodeURIComponent(path)}`
  );
  const isSaved = file ? file.isSaved : true;

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

  useEffect(() => {
    if (path) {
      const filename = path.split("/").at(-1);
      const suffix = isSaved ? "Triplex" : "Unsaved Changes";
      window.document.title = filename + " • " + suffix;
    }
  }, [path, isSaved]);

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame>
        <ScenesDrawer />

        <div className="pointer-events-none absolute top-4 left-4 right-4 bottom-4 flex gap-3">
          <div className="flex h-full w-52 flex-col gap-3">
            <EditorMenu />
            {path && <ScenePanel />}
          </div>

          <div className="mx-auto self-end">
            <ControlsMenu />
          </div>

          <div className="flex h-full w-72">
            <ContextPanel />
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
