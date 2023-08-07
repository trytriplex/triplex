/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface SearchStore {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  setIsOpen(open) {
    set({ isOpen: open });
  },
}));
