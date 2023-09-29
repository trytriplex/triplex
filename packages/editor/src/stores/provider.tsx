/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

export const useProviderStore = create<{
  show: () => void;
  hide: () => void;
  toggle: () => void;
  shown: boolean;
}>((set, get) => ({
  shown: false,
  show: () => set({ shown: true }),
  hide: () => set({ shown: false }),
  toggle: () => set({ shown: !get().shown }),
}));
