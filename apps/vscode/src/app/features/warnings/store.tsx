/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface UIWarningsStore {
  count: number;
  increment: () => () => void;
}

export const useUIWarnings = create<UIWarningsStore>((set) => ({
  count: 0,
  increment: () => {
    set((state) => ({ count: state.count + 1 }));
    return () => set((state) => ({ count: state.count - 1 }));
  },
}));
