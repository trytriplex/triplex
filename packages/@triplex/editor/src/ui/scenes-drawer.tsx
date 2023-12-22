/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws/react";
import { Suspense, useEffect, useState } from "react";
import { cn } from "../ds/cn";
import { Drawer } from "../ds/drawer";
import { ScrollContainer } from "../ds/scroll-container";
import { useEditor } from "../stores/editor";
import { useOverlayStore } from "../stores/overlay";
import { StringInput } from "./string-input";
import { AssetThumbnail } from "./thumbnail";

function normalize(str: string | undefined): string {
  if (!str) {
    return "";
  }

  return str.replaceAll("-", "").toLowerCase();
}

function Scenes({ filter = "" }: { filter?: string }) {
  const files = useLazySubscription("/scene");
  const { open, path, set } = useEditor();
  const { show } = useOverlayStore();

  function matchesFilter(
    filter: string,
    file: (typeof files)["scenes"][0]
  ): boolean {
    if (normalize(file.name).includes(filter)) {
      return true;
    }

    if (file.exports.some((exp) => normalize(exp.name).includes(filter))) {
      return true;
    }

    return false;
  }

  return (
    <div className="flex flex-col gap-2 px-2 pt-2" data-testid="file-drawer">
      {files.scenes.length === 0 && (
        <div className="px-2 pb-2.5 text-sm italic text-neutral-400">
          No files were found that can be opened. Your config might be invalid.{" "}
          <a
            className="text-sm text-blue-400"
            href="#"
            onClick={() =>
              window.triplex.openLink(
                "https://triplex.dev/docs/api-reference/config#files"
              )
            }
          >
            Learn more
          </a>
          .
        </div>
      )}

      {files.scenes.map((file) => {
        if (!matchesFilter(filter, file)) {
          return null;
        }

        const isPathOpen = path === file.path;

        return (
          <div
            className={cn([
              "p-1",
              isPathOpen && "rounded-lg bg-neutral-800/50",
            ])}
            key={file.path}
          >
            <small
              className={cn([
                isPathOpen ? "text-blue-400" : "text-neutral-300",
                "mb-0.5 block px-0.5 text-xs",
              ])}
            >
              {file.path.replace(files.cwd + "/", "")}
            </small>

            <div className="flex flex-wrap gap-1">
              {file.exports.map((exp) => (
                <AssetThumbnail
                  actionId="open_component"
                  asset={{
                    category: "",
                    exportName: exp.exportName,
                    name: exp.name,
                    path: file.path,
                    type: "custom",
                  }}
                  key={exp.exportName}
                  onClick={() => {
                    show(false);
                    open(file.path, exp.exportName);
                    set({
                      encodedProps: "",
                      exportName: exp.exportName,
                      path: file.path,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScenesDrawer() {
  const { show, shown } = useOverlayStore();
  const [filter, setFilter] = useState<string | undefined>();

  useEffect(() => {
    if (!shown) {
      setFilter(undefined);
    }
  }, [shown]);

  return (
    <Drawer
      label="Files"
      onClose={() => {
        show(false);
      }}
      open={shown === "open-scene"}
    >
      <Suspense
        fallback={<div className="p-4 text-neutral-400">Loading...</div>}
      >
        <div className="px-3 py-2">
          <StringInput
            autoFocus
            label="Filter components..."
            name="component-filter"
            onChange={(value) => setFilter(normalize(value))}
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
