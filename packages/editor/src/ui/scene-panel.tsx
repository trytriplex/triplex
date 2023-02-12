import { Fragment, useDeferredValue } from "react";
import { cn } from "../ds/cn";
import { useLazySubscription } from "../stores/ws-client";
import { useSceneStore } from "../stores/scene";
import { getEditorLink } from "../util/ide";
import { useEditorContext } from "../stores/editor-context";

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
        !selected && "text-neutral-400",
        selected
          ? "border-l-blue-500 bg-neutral-700"
          : "hover:border-l-blue-500 hover:bg-neutral-700 active:bg-neutral-600",
        "-mx-4 cursor-default border-l-2 border-transparent py-1.5 px-3 text-left text-sm -outline-offset-1",
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
  path: string;
  children: JsxElementPositions[];
}

export function ScenePanel() {
  const { path } = useEditorContext();
  const scene = useLazySubscription<{
    path: string;
    name: string;
    sceneObjects: JsxElementPositions[];
  }>(`/scene/${encodeURIComponent(path)}`);

  return (
    <div className="flex flex-col">
      <h2 className="mt-0.5 text-2xl font-medium">
        <div className="overflow-hidden text-ellipsis">{scene.name}</div>
      </h2>

      <div className="mb-2.5 -mt-0.5">
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

      <div className="-mx-4 mb-1 h-0.5 bg-neutral-700" />

      <SceneObjectButtons sceneObjects={scene.sceneObjects} />
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
  const focus = useSceneStore((store) => store.focus);
  const focused = useSceneStore((store) => store.focused);
  const deferredFocus = useDeferredValue(focused);

  return (
    <>
      {sceneObjects.map((child) => (
        <Fragment key={child.name + child.column + child.line}>
          <SceneComponent
            onClick={() =>
              focus({
                name: child.name,
                column: child.column,
                line: child.line,
                path: child.path,
              })
            }
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
