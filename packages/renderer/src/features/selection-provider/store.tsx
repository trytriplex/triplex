/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { send } from "@triplex/bridge/client";
import { create } from "zustand";
import { type SelectionState } from "./types";

export type SelectionListener = (e: MouseEvent) => SelectionState[];

export interface SelectionStore {
  clear: () => void;
  disabled: boolean;
  hovered: SelectionState | null;
  listen: (cb: SelectionListener) => () => void;
  listeners: SelectionListener[];
  select: (
    selection: SelectionState | SelectionState[],
    action: "replace" | "addition",
  ) => void;
  selections: SelectionState[];
  setDisabled: (disabled: boolean) => void;
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
  disabled: false,
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
  setDisabled: (disabled) => set({ disabled }),
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
