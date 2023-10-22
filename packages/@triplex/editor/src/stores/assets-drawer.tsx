/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
