/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { send } from "@triplex/bridge/client";
import { type Vector3 } from "three";
import { create } from "zustand";
import { type SelectionState } from "./types";

export interface XRInputSourceEvent {
  inputSourceDirection: Vector3;
  inputSourceOrigin: Vector3;
}

export type SelectionListener = (
  e: MouseEvent | XRInputSourceEvent,
) => SelectionState[];

export interface SelectionStore {
  clear: () => void;
  disabled: boolean;
  hovered: SelectionState | null;
  listen: (cb: SelectionListener, priority: number) => () => void;
  listeners: { cb: SelectionListener; priority: number }[];
  lock: () => void;
  release: () => void;
  select: (
    selection: SelectionState | SelectionState[],
    action: "replace" | "addition",
  ) => void;
  selections: SelectionState[];
  setDisabled: (disabled: boolean) => void;
  setHovered: (selection: SelectionState | null) => void;
  state: "locked" | "idle";
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  clear: () => {
    const { selections, setHovered, state } = get();

    if (state === "locked") {
      return;
    }

    if (selections.length) {
      set({ selections: [] });
      setHovered(null);
    }
  },
  disabled: false,
  hovered: null,
  listen: (cb, priority) => {
    set((state) => {
      const nextListeners = state.listeners
        .concat({ cb, priority })
        .sort((a, b) => a.priority - b.priority);

      return {
        listeners: nextListeners,
      };
    });

    return () => {
      set((state) => {
        return {
          listeners: state.listeners.filter((listener) => listener.cb !== cb),
        };
      });
    };
  },
  listeners: [],
  lock: () => {
    set({ state: "locked" });
  },
  release: () => {
    set({ state: "idle" });
  },
  select: (element, action) => {
    const { state } = get();

    if (state === "locked") {
      return;
    }

    switch (action) {
      case "replace": {
        const nextSelections = Array.isArray(element) ? element : [element];
        set({ hovered: null, selections: nextSelections });
        return;
      }

      case "addition": {
        const { selections } = get();
        const nextSelections = selections.concat(element);
        set({ hovered: null, selections: nextSelections });
        return;
      }
    }
  },
  selections: [],
  setDisabled: (disabled) => set({ disabled }),
  setHovered: (element) => {
    const { state } = get();

    if (state === "locked") {
      return;
    }

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
    });
  },
  state: "idle",
}));
