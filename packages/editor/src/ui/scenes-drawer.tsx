/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLazySubscription } from "@triplex/ws-client";
import { useEditor } from "../stores/editor";
import { cn } from "../ds/cn";
import { Drawer } from "../ds/drawer";
import { useOverlayStore } from "../stores/overlay";
import { ScrollContainer } from "../ds/scroll-container";
import { StringInput } from "./string-input";

function normalize(str: string | undefined): string {
  if (!str) {
    return "";
  }

  return str.replaceAll("-", "").toLowerCase();
}

function Scenes({ filter = "" }: { filter?: string }) {
  const files = useLazySubscription("/scene");
  const { path, exportName } = useEditor();
  const { show } = useOverlayStore();

  function matchesFilter(
    filter: string,
    file: (typeof files)["scenes"][0]
  ): boolean {
    if (normalize(file.name).includes(filter)) {
      return true;
    }

    if (file.exports.find((exp) => normalize(exp.name).includes(filter))) {
      return true;
    }

    return false;
  }

  return (
    <div className="flex flex-col gap-2 px-2 pt-2">
      {files.scenes.map((file) => {
        if (!matchesFilter(filter, file)) {
          return null;
        }

        return (
          <div
            className={cn([
              path === file.path && "-my-1 rounded-lg bg-neutral-800/50 py-1",
            ])}
            key={file.path}
          >
            <small className="block px-2 text-xs text-neutral-400">
              {file.path.replace(files.cwd + "/", "")}
            </small>

            {file.exports.map((exp) => (
              <Link
                key={exp.exportName}
                to={{
                  search: `?path=${file.path}&exportName=${exp.exportName}`,
                }}
                onClick={() => show(false)}
                className={cn([
                  path === file.path && exportName === exp.exportName
                    ? "bg-neutral-800 text-blue-400"
                    : "text-neutral-300",
                  "block select-none rounded-sm px-2 py-0.5 text-base outline-1 outline-blue-400 hover:bg-white/5 focus-visible:outline active:bg-white/10",
                ])}
              >
                <div>{exp.name}</div>
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ScenesDrawer() {
  const { shown, show } = useOverlayStore();
  const [filter, setFilter] = useState<string | undefined>();

  useEffect(() => {
    if (!shown) {
      setFilter(undefined);
    }
  }, [shown]);

  return (
    <Drawer
      title="Files"
      open={shown === "open-scene"}
      onClose={() => {
        show(false);
      }}
    >
      <Suspense
        fallback={<div className="p-4 text-neutral-400">Loading...</div>}
      >
        <div className="px-3 py-2">
          <StringInput
            autoFocus
            name="component-filter"
            onChange={(value) => setFilter(normalize(value))}
            label="Filter components..."
          />
        </div>

        <ScrollContainer>
          <Scenes filter={filter} />
          <div className="h-2" />
        </ScrollContainer>
      </Suspense>
    </Drawer>
  );
}
