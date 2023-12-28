/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws/react";
import { Fragment, Suspense, useEffect, useState } from "react";
import { cn } from "../ds/cn";
import { Drawer } from "../ds/drawer";
import { ScrollContainer } from "../ds/scroll-container";
import { useEditor } from "../stores/editor";
import { useOverlayStore } from "../stores/overlay";
import { filename, normalize } from "../util/string";
import { StringInput } from "./string-input";
import { AssetThumbnail } from "./thumbnail";

function Scenes({ filter = "" }: { filter?: string }) {
  const files = useLazySubscription("/scene");
  const { open, set } = useEditor();
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
    <div className="flex flex-col gap-8 px-4 pt-2" data-testid="file-drawer">
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

      {files.scenes.map((file, index) => {
        if (!matchesFilter(filter, file)) {
          return null;
        }

        const isLastElement = index === files.scenes.length - 1;

        return (
          <Fragment key={file.path}>
            <div className="select-none">
              <div className="mb-2 text-sm font-medium text-neutral-300">
                {filename(file.path)}
              </div>

              <div className="flex flex-wrap gap-3">
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
                      open(file.path, exp.exportName);
                      show(false);
                      set(
                        {
                          encodedProps: "",
                          exportName: exp.exportName,
                          path: file.path,
                        },
                        { skipTransition: true }
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className={cn([
                "-mx-4 border-b",
                isLastElement ? "border-transparent" : "border-neutral-800",
              ])}
            />
          </Fragment>
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
            label="Filter files, components..."
            name="component-filter"
            onChange={(value) => setFilter(normalize(value))}
          />
        </div>

        <ScrollContainer>
          <div className="h-2" />
          <Scenes filter={filter} />
          <div className="h-2" />
        </ScrollContainer>
      </Suspense>
    </Drawer>
  );
}
