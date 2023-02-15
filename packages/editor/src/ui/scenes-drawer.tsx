import { Suspense } from "react";
import { Link } from "react-router-dom";
import { useLazySubscription } from "@triplex/ws-client";
import { useEditor } from "../stores/editor";
import { cn } from "../ds/cn";
import { Drawer, DrawerContent } from "../ds/drawer";
import { useOverlayStore } from "../stores/overlay";

function Scenes() {
  const files = useLazySubscription<{
    cwd: string;
    scenes: { path: string; name: string }[];
  }>("/scene");
  const { path } = useEditor();

  return (
    <>
      {files?.scenes.map((file) => (
        <Link
          key={file.path}
          to={{ search: `?path=${file.path}` }}
          className={cn([
            path === file.path
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

export function ScenesDrawer() {
  const { shown, show } = useOverlayStore();

  return (
    <Drawer open={shown === "open-scene"} onClose={() => show(false)}>
      <DrawerContent title="Files">
        <Suspense fallback={null}>
          <Scenes />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}
