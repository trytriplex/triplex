/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { compose, on, send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { useSelectionStore } from "./use-selection-store";

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const selectElement = useSelectionStore((store) => store.select);
  const clearSelection = useSelectionStore((store) => store.clear);

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

  return children;
}
