/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

export const useFilter = create<{ filter: string; set(filter: string): void }>(
  (set) => ({
    filter: "",
    set: (filter) => set({ filter }),
  }),
);
