import { useSearchParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { EditorMenu } from "./ui/editor-menu";
import { SceneList } from "./ui/scene-list";
import { SceneComponents } from "./ui/scene-components";
import { SceneFrame } from "./scence-bridge";
import { ErrorBoundary } from "react-error-boundary";

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

      <div className="absolute top-4 left-4 bottom-4 flex w-52 flex-col rounded bg-neutral-800/90 shadow-2xl shadow-black">
        <div className="p-1">
          <EditorMenu />
        </div>

        <div className="border-t-2 border-neutral-700" />

        <div className="pt-2 text-neutral-300">
          <ErrorBoundary resetKeys={[path]} fallbackRender={() => null}>
            <Suspense fallback={<div className="px-3">Loading...</div>}>
              {path && <SceneComponents />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
