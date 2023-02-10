import { Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "../ds/cn";
import { Drawer, DrawerContent } from "../ds/drawer";
import { useOverlayStore } from "../stores/overlay";
import { useLazySubscription } from "../stores/ws-client";

function Files() {
  const files = useLazySubscription<{
    cwd: string;
    scenes: { path: string; name: string }[];
  }>("/scene");
  const [search] = useSearchParams();
  const current = search.get("path");

  return (
    <>
      {files?.scenes.map((file) => (
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
