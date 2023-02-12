import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect } from "react";
import { EditorMenu } from "./ui/editor-menu";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { ScenePanel } from "./ui/scene-panel";
import { SceneFrame } from "./scence-bridge";
import { ContextPanel } from "./ui/context-panel";
import { useEditorContext } from "./stores/editor-context";

export function EditorFrame() {
  const { path } = useEditorContext();

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • TRIPLEX";
    }
  }, [path]);

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame />
      <ScenesDrawer />

      <div className="absolute top-4 left-4 bottom-4 flex w-52 flex-col gap-4">
        <div className="rounded-lg bg-neutral-800/90 p-1 shadow-2xl shadow-black/50">
          <EditorMenu />
        </div>

        {path && (
          <div className="h-full rounded-lg bg-neutral-800/90 p-4 text-neutral-300 shadow-2xl shadow-black/50">
            <ErrorBoundary
              resetKeys={[path]}
              fallbackRender={() => <div>Error!</div>}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <ScenePanel />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>

      {path && <ContextPanel />}
    </div>
  );
}
