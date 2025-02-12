/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

interface AssetsDrawer {
  hide: () => void;
  show: (target?: {
    column: number;
    exportName: string;
    line: number;
    path: string;
  }) => void;
  shown:
    | boolean
    | { column: number; exportName: string; line: number; path: string };
}

export const useAssetsDrawer = create<AssetsDrawer>((set) => ({
  hide: () => set({ shown: false }),
  show: (object) => set({ shown: object || true }),
  shown: false,
}));
