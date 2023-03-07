import { useEffect } from "react";
import { ContextPanel } from "./ui/context-panel";
import { EditorMenu } from "./ui/editor-menu";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";

export function EditorFrame() {
  const { path } = useEditor();

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • Triplex";
    }
  }, [path]);

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame>
        <ScenesDrawer />

        <div className="absolute top-4 left-4 bottom-4 flex w-52 flex-col gap-4">
          <div className="rounded-lg bg-neutral-800/90 p-1 shadow-2xl shadow-black/50">
            <EditorMenu />
          </div>

          {path && <ScenePanel />}
        </div>

        {path && <ContextPanel />}
      </SceneFrame>
    </div>
  );
}
