/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
