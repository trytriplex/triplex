import { Fragment, Suspense, useDeferredValue } from "react";
import { cn } from "../ds/cn";
import { useLazySubscription } from "@triplex/ws-client";
import { getEditorLink } from "../util/ide";
import { useEditor } from "../stores/editor";
import { useScene } from "../scence-bridge";
import { ScrollContainer } from "../ds/scroll-container";
import { ErrorBoundary } from "react-error-boundary";

function SceneComponent({
  name,
  selected,
  onClick,
  level = 1,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
  level?: number;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      style={{ paddingLeft: level === 1 ? 13 : level * 13 }}
      className={cn([
        selected
          ? "border-l-blue-400 bg-white/5 text-blue-400"
          : "text-neutral-400 hover:border-l-blue-400 hover:bg-white/5 active:bg-neutral-700",
        "block w-[208px] cursor-default overflow-hidden text-ellipsis border-l-2 border-transparent py-1.5 px-3 text-left text-sm -outline-offset-1",
      ])}
    >
      {name}
    </button>
  );
}

interface JsxElementPositions {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "host" | "custom";
}

export function ScenePanel() {
  const { path } = useEditor();

  return (
    <div className="h-full overflow-hidden rounded-lg bg-neutral-900/[97%] shadow-2xl shadow-black/50">
      <ErrorBoundary
        resetKeys={[path]}
        fallbackRender={() => (
          <div className="p-4 text-neutral-400">Error!</div>
        )}
      >
        <Suspense
          fallback={<div className="p-4 text-neutral-400">Loading...</div>}
        >
          <SceneContents />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function SceneContents() {
  const { path, exportName } = useEditor();
  const file = useLazySubscription<{ isSaved: boolean }>(
    `/scene/${encodeURIComponent(path)}`
  );
  const scene = useLazySubscription<{
    path: string;
    name: string;
    sceneObjects: JsxElementPositions[];
  }>(`/scene/${encodeURIComponent(path)}/${exportName}`);

  return (
    <div className="flex h-full flex-shrink flex-col">
      <h2 className="flex flex-row px-4 pt-3 text-2xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">{scene.name}</div>
        {!file.isSaved && <span aria-label="Unsaved changes">*</span>}
      </h2>

      <div className="mb-2.5 -mt-0.5 px-4">
        <a
          className="text-xs text-neutral-400"
          href={getEditorLink({
            path,
            column: 1,
            line: 1,
            editor: "vscode",
          })}
        >
          View source
        </a>
      </div>

      <div className="h-[1px] bg-neutral-800" />

      <ScrollContainer>
        <div className="h-2" />
        <SceneObjectButtons sceneObjects={scene.sceneObjects} />
        <div className="h-2" />
      </ScrollContainer>
    </div>
  );
}

function SceneObjectButtons({
  sceneObjects,
  level = 1,
}: {
  sceneObjects: JsxElementPositions[];
  level?: number;
}) {
  const { focus } = useScene();
  const { target, path } = useEditor();
  const deferredFocus = useDeferredValue(target);

  return (
    <>
      {sceneObjects.map((child) => (
        <Fragment key={child.name + child.column + child.line}>
          <SceneComponent
            onClick={() => {
              focus({
                column: child.column,
                line: child.line,
                ownerPath: path,
              });
            }}
            level={level}
            selected={
              !!deferredFocus &&
              deferredFocus.column === child.column &&
              deferredFocus.line === child.line
            }
            name={child.name}
          />
          <SceneObjectButtons sceneObjects={child.children} level={level + 1} />
        </Fragment>
      ))}
    </>
  );
}
