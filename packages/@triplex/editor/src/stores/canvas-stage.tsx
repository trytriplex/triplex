/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type EditorSettings, type ProjectSettings } from "@triplex/server";
import { create } from "zustand";

interface CanvasStageStore {
  canvasStage: EditorSettings["layout"];
  canvasZoom: number;
  decreaseZoom: () => void;
  fitFrameToViewport: () => void;
  fitFrameToViewportCounter: number;
  frame: ProjectSettings["frame"];
  increaseZoom: () => void;
  resetZoom: () => void;
  resetZoomCounter: number;
  setCanvasZoom: (zoom: number) => void;
  setFrame: (frame: ProjectSettings["frame"]) => void;
  toggleCanvasStage: () => void;
}

function getZoomIncrement(zoom: number) {
  switch (true) {
    case zoom >= 300:
      return 300;

    case zoom >= 200:
      return 100;

    case zoom >= 100:
      return 50;

    default:
      return 25;
  }
}

function getZoomDecrement(zoom: number) {
  switch (true) {
    case zoom > 300:
      return 300;

    case zoom > 200:
      return 100;

    case zoom > 100:
      return 50;

    default:
      return 25;
  }
}

export const useCanvasStage = create<CanvasStageStore>((set, get) => ({
  canvasStage: window.triplex.env.editor.layout,
  canvasZoom: 100,
  decreaseZoom() {
    const store = get();
    const multiplier = getZoomDecrement(store.canvasZoom);
    const nextZoom = store.canvasZoom - multiplier;

    if (nextZoom >= 25) {
      store.setCanvasZoom(nextZoom);
    }
  },
  fitFrameToViewport() {
    const store = get();
    set({ fitFrameToViewportCounter: store.fitFrameToViewportCounter + 1 });
  },
  fitFrameToViewportCounter: 0,
  frame: window.triplex.env.project.frame,
  increaseZoom() {
    const store = get();
    const multiplier = getZoomIncrement(store.canvasZoom);
    const nextZoom = store.canvasZoom + multiplier;

    if (nextZoom <= 900) {
      store.setCanvasZoom(nextZoom);
    }
  },
  resetZoom() {
    const store = get();
    set({ canvasZoom: 100, resetZoomCounter: store.resetZoomCounter + 1 });
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
