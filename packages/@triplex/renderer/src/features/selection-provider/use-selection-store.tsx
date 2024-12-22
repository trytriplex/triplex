/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";
import { type SelectionState } from "./types";

export interface SelectionStore {
  clear: () => void;
  select: (
    selection: SelectionState | SelectionState[],
    action: "replace" | "addition",
  ) => void;
  selections: SelectionState[];
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  clear: () => {
    const { selections } = get();
    if (selections.length) {
      set({ selections: [] });
    }
  },
  select: (element, action) => {
    switch (action) {
      case "replace": {
        const nextSelections = Array.isArray(element) ? element : [element];
        set({ selections: nextSelections });
        return;
      }

      case "addition": {
        const { selections } = get();
        const nextSelections = selections.concat(element);
        set({ selections: nextSelections });
        return;
      }
    }
  },
  selections: [],
}));
