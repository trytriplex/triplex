import { create } from "zustand";

interface OverlayState {
  show: (shown: false | "open-scene") => void;
  shown: false | "open-scene";
}

export const useOverlayStore = create<OverlayState>((set) => ({
  shown: false,
  show: (shown) => set({ shown }),
}));
