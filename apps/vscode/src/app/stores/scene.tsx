/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, send } from "@triplex/bridge/host";
import { useCallback } from "react";
import { create } from "zustand";

interface ElementLocation {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}

interface SceneStore {
  blurElement(): void;
  context: {
    exportName: string;
    path: string;
  };
  focusElement(selected: ElementLocation): void;
  selected: ElementLocation | undefined;
  syncContext(ctx: SceneStore["context"]): void;
  syncSelected(selected: SceneStore["selected"]): void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  blurElement: () => send("request-blur-element", undefined),
  context: window.triplex.initialState,
  focusElement: (data) => send("request-focus-element", data),
  selected: undefined,
  syncContext: (ctx) => set({ context: ctx }),
  syncSelected: (selected) => set({ selected }),
}));

export function useInitSceneSync() {
  const syncSelected = useSceneStore((store) => store.syncSelected);

  const init = useCallback(() => {
    return compose([
      on("element-blurred", syncSelected),
      on("element-focused", syncSelected),
      on("ready", () => {
        send("request-open-component", {
          encodedProps: "",
          exportName: window.triplex.initialState.exportName,
          path: window.triplex.initialState.path,
        });
      }),
    ]);
  }, [syncSelected]);

  return init;
}
