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
    scenes: { path: string; name: string; exports: string[] }[];
  }>("/scene");
  const { path, exportName } = useEditor();
  const { show } = useOverlayStore();

  return (
    <div className="flex flex-col gap-2">
      {files?.scenes.map((file) => (
        <div
          className={cn([
            path === file.path && "rounded bg-neutral-700/50 py-1",
          ])}
          key={file.path}
        >
          <small className="block px-2 text-xs text-neutral-400">
            {file.path.replace(files.cwd + "/", "")}
          </small>
          {file.exports.map((exp) => (
            <Link
              key={exp}
              to={{ search: `?path=${file.path}&exportName=${exp}` }}
              onClick={() => show(false)}
              className={cn([
                path === file.path && exportName === exp
                  ? "bg-neutral-700 text-blue-400"
                  : "text-neutral-300",
                "block select-none px-2 text-base outline-none hover:bg-neutral-700 active:bg-neutral-600",
              ])}
            >
              <div>{exp}</div>
            </Link>
          ))}
        </div>
      ))}
    </div>
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
