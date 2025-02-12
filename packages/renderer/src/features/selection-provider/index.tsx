/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
  const disabled = useSelectionStore((store) => store.disabled);

  useEffect(() => {
    if (disabled) {
      return;
    }

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
      on("element-hint", (element) => {
        setHovered(element);
      }),
    ]);
  }, [clearSelection, disabled, selectElement, setHovered]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const getMovedDelta = (e: MouseEvent) =>
      Math.abs(e.clientX - origin[0]) + Math.abs(e.clientY - origin[1]);

    let origin = [-1, -1];
    let isPotentiallyDragging = false;

    return bindAll(document, [
      {
        listener: () => {
          setHovered(null);
        },
        type: "mouseout",
      },
      {
        listener: rafSchd((e: MouseEvent) => {
          if (isPotentiallyDragging) {
            if (getMovedDelta(e) > 1) {
              // When the mouse has moved too much we get rid of the hovered element.
              setHovered(null);
              return;
            }
          }

          const result = listeners.flatMap((listener) => listener(e));
          const hit = result.at(0) ?? null;

          setHovered(hit);
        }),
        type: "mousemove",
      },
      {
        listener: (e) => {
          isPotentiallyDragging = true;
          origin = [e.clientX, e.clientY];
        },
        type: "mousedown",
      },
      {
        listener: (e) => {
          isPotentiallyDragging = false;

          if (getMovedDelta(e) > 1) {
            // If the mouse has moved too much we bail out of selecting elements.
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
  }, [
    clearSelection,
    disabled,
    listeners,
    selectElement,
    selections,
    setHovered,
  ]);

  return children;
}
