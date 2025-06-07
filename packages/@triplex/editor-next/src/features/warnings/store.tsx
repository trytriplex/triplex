/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
