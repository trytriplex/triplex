/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface PanelsStore {
  layout: "expanded" | "collapsed";
  toggleLayout: () => void;
}

export const usePanels = create<PanelsStore>((set, get) => ({
  layout: window.triplex.editorConfig.layout,
  toggleLayout() {
    const store = get();
    set({ layout: store.layout === "collapsed" ? "expanded" : "collapsed" });
  },
}));
