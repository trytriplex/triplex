/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

export const useCanvasMounted = create<{
  mounted: boolean | undefined;
  setMounted: (mounted: boolean) => void;
}>((set) => ({
  mounted: undefined,
  setMounted: (mounted) => {
    set({ mounted });
  },
}));
