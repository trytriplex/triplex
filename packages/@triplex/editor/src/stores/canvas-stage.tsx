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
  frame: "expanded" | "intrinsic";
  setCanvasZoom: (zoom: number) => void;
  setFrame: (frame: "expanded" | "intrinsic") => void;
  toggleCanvasStage: () => void;
}

export const useCanvasStage = create<CanvasStageStore>((set, get) => ({
  canvasStage: window.triplex.editorConfig.layout,
  canvasZoom: 1,
  frame: "intrinsic",
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
