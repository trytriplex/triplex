/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { create } from "zustand";
import { type SelectionState } from "./types";

export type SelectionListener = (e: MouseEvent) => SelectionState[];

export interface SelectionStore {
  clear: () => void;
  hovered: SelectionState | null;
  listen: (cb: SelectionListener) => () => void;
  listeners: SelectionListener[];
  select: (
    selection: SelectionState | SelectionState[],
    action: "replace" | "addition",
  ) => void;
  selections: SelectionState[];
  setHovered: (selection: SelectionState | null) => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  clear: () => {
    const { selections, setHovered } = get();
    if (selections.length) {
      set({ selections: [] });
      setHovered(null);
    }
  },
  hovered: null,
  listen: (cb) => {
    set((state) => {
      return {
        listeners: state.listeners.concat(cb),
      };
    });

    return () => {
      set((state) => {
        return {
          listeners: state.listeners.filter((listener) => listener !== cb),
        };
      });
    };
  },
  listeners: [],
  select: (element, action) => {
    const { setHovered } = get();

    switch (action) {
      case "replace": {
        const nextSelections = Array.isArray(element) ? element : [element];
        set({ selections: nextSelections });
        setHovered(null);
        return;
      }

      case "addition": {
        const { selections } = get();
        const nextSelections = selections.concat(element);
        set({ selections: nextSelections });
        setHovered(null);
        return;
      }
    }
  },
  selections: [],
  setHovered: (element) =>
    set((prevState) => {
      if (
        element === prevState.hovered ||
        (element &&
          prevState.hovered &&
          element.column === prevState.hovered.column &&
          element.line === prevState.hovered.line &&
          element.parentPath === prevState.hovered.parentPath &&
          element.path === prevState.hovered.path)
      ) {
        return prevState;
      }

      send("element-hint", element);

      return { hovered: element };
    }),
}));
