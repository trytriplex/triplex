/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
