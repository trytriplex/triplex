import { useEffect } from "react";
import { ContextPanel } from "./ui/context-panel";
import { EditorMenu } from "./ui/editor-menu";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { ControlsMenu } from "./ui/controls-menu";
import { useLazySubscription } from "@triplex/ws-client";
import { cn } from "./ds/cn";

export function EditorFrame() {
  const { path, save, undo, redo, deleteComponent } = useEditor();
  const { name } = useLazySubscription<{ name: string }>("/folder");
  const filename = path.split("/").at(-1);
  const windowTitle = filename ? filename + " — " + name : name;

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
    if (windowTitle) {
      window.document.title = windowTitle;
    }
  }, [windowTitle]);

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame>
        <div
          className={cn([
            "pointer-events-none absolute inset-0 grid grid-cols-[14rem_auto_18rem] gap-3 pb-3",
            __TRIPLEX_TARGET__ === "electron"
              ? "grid-rows-[32px_auto]"
              : "pt-3",
          ])}
        >
          {__TRIPLEX_TARGET__ === "electron" && (
            <div className="z-50 col-span-full row-start-1 flex h-8 select-none items-center justify-center border-b border-neutral-800 bg-neutral-900 [-webkit-app-region:drag]">
              <span className="text-sm text-neutral-300">{windowTitle}</span>
            </div>
          )}

          <div className="row-auto flex flex-col gap-3 overflow-hidden pl-3">
            <EditorMenu />
            {path && <ScenePanel />}
          </div>

          <div className="mx-auto self-end">
            <ControlsMenu />
          </div>

          <div className="flex overflow-hidden pr-3">
            <ContextPanel />
          </div>
        </div>

        <ScenesDrawer />
      </SceneFrame>
    </div>
  );
}
