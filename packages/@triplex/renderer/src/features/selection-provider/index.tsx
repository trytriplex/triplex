/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { compose, on, send } from "@triplex/bridge/client";
import { bindAll } from "bind-event-listener";
import rafSchd from "raf-schd";
import { useEffect } from "react";
import { useSelectionStore } from "./store";

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const selectElement = useSelectionStore((store) => store.select);
  const setHovered = useSelectionStore((store) => store.setHovered);
  const clearSelection = useSelectionStore((store) => store.clear);
  const listeners = useSelectionStore((store) => store.listeners);
  const selections = useSelectionStore((store) => store.selections);

  useEffect(() => {
    return compose([
      on("request-open-component", () => {
        clearSelection();
      }),
      on("request-focus-element", (data) => {
        selectElement(data, "replace");
        send("element-focused", data);
        send("track", { actionId: "element_focus" });
      }),
      on("request-blur-element", () => {
        clearSelection();
        send("track", { actionId: "element_blur" });
        send("element-blurred", undefined);
      }),
    ]);
  }, [clearSelection, selectElement]);

  useEffect(() => {
    let origin = [-1, -1];
    let isMouseDown = false;

    return bindAll(document, [
      {
        listener: () => {
          setHovered(null);
        },
        type: "mouseout",
      },
      {
        listener: rafSchd((e: MouseEvent) => {
          if (isMouseDown) {
            setHovered(null);
            return;
          }

          const hitTestResult = listeners.flatMap((listener) => listener(e));
          setHovered(hitTestResult.at(0) ?? null);
        }),
        type: "mousemove",
      },
      {
        listener: (e) => {
          isMouseDown = true;
          origin = [e.offsetX, e.offsetY];
        },
        type: "mousedown",
      },
      {
        listener: (e) => {
          isMouseDown = false;

          const delta =
            Math.abs(e.offsetX - origin[0]) + Math.abs(e.offsetY - origin[1]);

          if (delta > 1) {
            return;
          }

          const selectionMode: "cycle" | "default" =
            e.detail >= 2
              ? // If there have been 2 or more consecutive clicks we change the selection mode to cycle.
                "cycle"
              : "default";
          const hitTestResult = listeners.flatMap((listener) => listener(e));

          if (selectionMode === "default") {
            if (hitTestResult.length) {
              selectElement(hitTestResult[0], "replace");
              send("element-focused", hitTestResult[0]);
              send("track", { actionId: "element_focus" });
            } else {
              clearSelection();
              send("track", { actionId: "element_blur" });
              send("element-blurred", undefined);
            }
          } else {
            const lastSelectedElement = selections.at(-1);
            const currentIndex = hitTestResult.findIndex((selection) => {
              if (
                selection.column === lastSelectedElement?.column &&
                selection.line === lastSelectedElement?.line &&
                selection.parentPath === lastSelectedElement?.parentPath &&
                selection.path === lastSelectedElement?.path
              ) {
                // We found a direct match!
                return true;
              }

              return false;
            });

            const nextIndex = (currentIndex + 1) % hitTestResult.length;
            const nextSelection = hitTestResult.at(nextIndex);

            if (nextSelection) {
              selectElement(nextSelection, "replace");
              send("element-focused", nextSelection);
              send("track", { actionId: "element_focus" });
              return;
            }
          }
        },
        type: "mouseup",
      },
    ]);
  }, [clearSelection, listeners, selectElement, selections, setHovered]);

  return children;
}
