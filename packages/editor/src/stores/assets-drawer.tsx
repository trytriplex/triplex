/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface AssetsDrawer {
  show: (target?: {
    path: string;
    exportName: string;
    line: number;
    column: number;
  }) => void;
  hide: () => void;
  shown:
    | boolean
    | { exportName: string; path: string; line: number; column: number };
}

export const useAssetsDrawer = create<AssetsDrawer>((set) => ({
  shown: false,
  show: (object) => set({ shown: object || true }),
  hide: () => set({ shown: false }),
}));
