import { Suspense } from "react";
import { suspend } from "suspend-react";
import { Link, useSearchParams } from "react-router-dom";
import { Drawer, DrawerContent } from "../ds/drawer";
import { useOverlayStore } from "../stores/overlay";
import { cn } from "../ds/cn";

function Files() {
  const files = suspend(
    async () => {
      const res = await fetch("http://localhost:8000/scene");
      return res.json() as Promise<{
        cwd: string;
        scenes: { path: string; name: string }[];
      }>;
    },
    ["files"],
    { lifespan: 0 }
  );
  const [search] = useSearchParams();
  const current = search.get("path");

  return (
    <>
      {files.scenes.map((file) => (
        <Link
          replace
          key={file.path}
          to={{ search: `?path=${file.path}` }}
          className={cn([
            current === file.path
              ? "bg-neutral-700 text-blue-500"
              : "text-neutral-300",
            "block select-none  rounded px-2 py-1 text-base outline-none hover:bg-neutral-700 active:bg-neutral-600",
          ])}
        >
          <div>{file.name}</div>
          <small className="-mt-1 block text-neutral-400">
            {file.path.replace(files.cwd, "")}
          </small>
        </Link>
      ))}
    </>
  );
}

export function SceneList() {
  const { shown, show } = useOverlayStore();

  return (
    <Drawer open={shown === "open-scene"} onClose={() => show(false)}>
      <DrawerContent title="Files">
        <Suspense fallback={null}>
          <Files />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}
