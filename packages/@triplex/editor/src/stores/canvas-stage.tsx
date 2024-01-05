/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface CanvasStageStore {
  canvasStage: "expanded" | "collapsed";
  canvasZoom: number;
  decreaseZoom: () => void;
  frame: "expanded" | "intrinsic";
  increaseZoom: () => void;
  resetZoom: () => void;
  resetZoomCounter: number;
  setCanvasZoom: (zoom: number) => void;
  setFrame: (frame: "expanded" | "intrinsic") => void;
  toggleCanvasStage: () => void;
}

export const useCanvasStage = create<CanvasStageStore>((set, get) => ({
  canvasStage: window.triplex.editorConfig.layout,
  canvasZoom: 1,
  decreaseZoom() {
    const store = get();
    const nextZoom = store.canvasZoom / 2;

    if (nextZoom >= 0.25) {
      store.setCanvasZoom(nextZoom);
    }
  },
  frame: "intrinsic",
  increaseZoom() {
    const store = get();
    const nextZoom = store.canvasZoom * 2;

    if (nextZoom <= 4) {
      store.setCanvasZoom(nextZoom);
    }
  },
  resetZoom() {
    const store = get();
    set({ canvasZoom: 1, resetZoomCounter: store.resetZoomCounter + 1 });
  },
  resetZoomCounter: 0,
  setCanvasZoom(zoom) {
    set({ canvasZoom: zoom });
  },
  setFrame(frame) {
    set({ frame });
  },
  toggleCanvasStage() {
    const store = get();
    set({
      canvasStage: store.canvasStage === "collapsed" ? "expanded" : "collapsed",
    });
  },
}));
