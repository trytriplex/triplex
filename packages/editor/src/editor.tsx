import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { EditorMenu } from "./ui/editor-menu";
import { SceneList } from "./ui/scene-list";
import { ScenePanel } from "./ui/scene-panel";
import { SceneFrame } from "./scence-bridge";
import { ContextPanel } from "./ui/context-panel";

export function EditorFrame() {
  const [searchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • TRIPLEX";
    }
  }, [path]);

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame />
      <SceneList />

      <div className="absolute top-4 left-4 bottom-4 flex w-52 flex-col gap-4">
        <div className="rounded-lg bg-neutral-800/90 p-1 shadow-2xl shadow-black/50">
          <EditorMenu />
        </div>

        {path && (
          <div className="h-full rounded-lg bg-neutral-800/90 p-4 pt-2 text-neutral-300 shadow-2xl shadow-black/50">
            <ErrorBoundary resetKeys={[path]} fallbackRender={() => null}>
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
