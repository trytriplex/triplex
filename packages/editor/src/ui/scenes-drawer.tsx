/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useLazySubscription } from "@triplex/ws-client";
import { useEditor } from "../stores/editor";
import { cn } from "../ds/cn";
import { Drawer } from "../ds/drawer";
import { useOverlayStore } from "../stores/overlay";
import { ScrollContainer } from "../ds/scroll-container";
import { StringInput } from "./string-input";

function Scenes({ filter = "" }: { filter?: string }) {
  const files = useLazySubscription("/scene");
  const { path, exportName } = useEditor();
  const { show } = useOverlayStore();

  const components = files.scenes.filter((scene) =>
    scene.name.includes(filter)
  );

  return (
    <div className="flex flex-col gap-2 px-2 pt-2">
      {components.map((file) => (
        <div
          className={cn([
            path === file.path && "rounded-md bg-neutral-800/50 py-1",
          ])}
          key={file.path}
        >
          <small className="block px-2 text-xs text-neutral-400">
            {file.path.replace(files.cwd + "/", "")}
          </small>
          {file.exports.map((exp) => (
            <Link
              key={exp.exportName}
              to={{ search: `?path=${file.path}&exportName=${exp.exportName}` }}
              onClick={() => show(false)}
              className={cn([
                path === file.path && exportName === exp.exportName
                  ? "bg-neutral-800 text-blue-400"
                  : "text-neutral-300",
                "block select-none px-2 text-base outline-none hover:bg-white/5 active:bg-white/10",
              ])}
            >
              <div>{exp.name}</div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ScenesDrawer() {
  const { shown, show } = useOverlayStore();
  const [filter, setFilter] = useState<string | undefined>();

  return (
    <Drawer
      title="Files"
      open={shown === "open-scene"}
      onClose={() => {
        show(false);
        setFilter(undefined);
      }}
    >
      <Suspense
        fallback={<div className="p-4 text-neutral-400">Loading...</div>}
      >
        <div className="p-2">
          <StringInput
            name="search"
            onChange={setFilter}
            label="Filter components..."
          />
        </div>
        <div className="flex-shrink-0 border-t border-neutral-800" />
        <ScrollContainer>
          <Scenes filter={filter} />
          <div className="h-2" />
        </ScrollContainer>
      </Suspense>
    </Drawer>
  );
}
