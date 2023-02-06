import { useSearchParams } from "react-router-dom";
import { suspend } from "suspend-react";
import { cn } from "../ds/cn";
import { useSceneStore } from "../stores/scene";

function SceneComponent({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className={cn([
        selected
          ? "border-l-blue-500 bg-neutral-700"
          : "hover:border-l-blue-500 hover:bg-neutral-700 active:bg-neutral-600",
        "cursor-default border-2 border-transparent py-0.5 px-3 text-left text-sm text-neutral-300 -outline-offset-1",
      ])}
    >
      {name}
    </button>
  );
}

export function SceneComponents() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const scene = suspend(
    async () => {
      const res = await fetch(
        `http://localhost:8000/scene/${encodeURIComponent(path)}`
      );
      return res.json() as Promise<{
        sceneObjects: {
          name: string;
          line: number;
          column: number;
          path: string;
        }[];
      }>;
    },
    [path],
    { lifespan: 0 }
  );
  const focused = useSceneStore((store) => store.focused);
  const focus = useSceneStore((store) => store.focus);

  if (!scene || !scene.sceneObjects) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {scene.sceneObjects.map((obj) => (
        <SceneComponent
          onClick={() =>
            focus({ column: obj.column, line: obj.line, path: obj.path })
          }
          selected={
            !!focused &&
            focused.column === obj.column &&
            focused.line === obj.line
          }
          name={obj.name}
          key={obj.name}
        />
      ))}
    </div>
  );
}
