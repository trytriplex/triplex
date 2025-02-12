/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

export const useProviderStore = create<{
  hide: () => void;
  show: () => void;
  shown: boolean;
  toggle: () => void;
}>((set, get) => ({
  hide: () => set({ shown: false }),
  show: () => set({ shown: true }),
  shown: false,
  toggle: () => set({ shown: !get().shown }),
}));
