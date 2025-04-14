/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { create } from "zustand";
import { type Space, type TransformControlMode } from "./types";

const transforms = [
  "none",
  "translate",
  "rotate",
  "scale",
] satisfies TransformControlMode[];
const spaces = ["world", "local"] satisfies Space[];

export interface ActionsStore {
  cycleSpace: () => void;
  cycleTransform: () => void;
  setSpace: (space: Space) => void;
  setTransform: (transform: TransformControlMode) => void;
  space: Space;
  transform: TransformControlMode;
}

export const useActionsStore = create<ActionsStore>((set, get) => ({
  cycleSpace: () => {
    const currentSpace = get().space;
    const currentIndex = spaces.indexOf(currentSpace);
    const nextIndex = (currentIndex + 1) % spaces.length;
    const nextSpace = spaces[nextIndex];
    set({ space: nextSpace });
  },
  cycleTransform: () => {
    const currentTransform = get().transform;
    const currentIndex = transforms.indexOf(currentTransform);
    const nextIndex = (currentIndex + 1) % transforms.length;
    const nextTransform = transforms[nextIndex];
    set({ transform: nextTransform });
  },
  setSpace: (space) => set({ space }),
  setTransform: (transform) => set({ transform }),
  space: "world",
  transform: "none",
}));
