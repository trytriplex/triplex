import { Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../ds/cn";
import { useLazySubscription } from "../stores/ws-client";
import { useSceneStore } from "../stores/scene";

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
  const subtle = level > 1;
  return (
    <button
      type="submit"
      onClick={onClick}
      style={{ paddingLeft: level * 12 }}
      className={cn([
        subtle && !selected && "text-neutral-400",
        !subtle && !selected && "text-neutral-300",
        selected
          ? "border-l-blue-500 bg-neutral-700"
          : "hover:border-l-blue-500 hover:bg-neutral-700 active:bg-neutral-600",
        "cursor-default border-2 border-transparent py-0.5 px-3 text-left text-sm -outline-offset-1",
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

export function SceneComponents() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const scene = useLazySubscription<{
    sceneObjects: JsxElementPositions[];
  }>(`/scene/${encodeURIComponent(path)}`);

  return (
    <div className="flex flex-col">
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

  return (
    <>
      {sceneObjects.map((child) => (
        <Fragment key={child.name + child.column + child.line}>
          <SceneComponent
            onClick={() =>
              focus({
                column: child.column,
                line: child.line,
                path: child.path,
              })
            }
            level={level}
            selected={
              !!focused &&
              focused.column === child.column &&
              focused.line === child.line
            }
            name={child.name}
          />
          <SceneObjectButtons sceneObjects={child.children} level={level + 1} />
        </Fragment>
      ))}
    </>
  );
}
