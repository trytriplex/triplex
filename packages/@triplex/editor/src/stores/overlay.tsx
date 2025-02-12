/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

interface OverlayState {
  show: (shown: false | "open-scene") => void;
  shown: false | "open-scene";
}

export const useOverlayStore = create<OverlayState>((set) => ({
  show: (shown) => set({ shown }),
  shown: false,
}));
