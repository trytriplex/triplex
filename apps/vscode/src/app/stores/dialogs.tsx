/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

type Dialogs = "help" | "open_in_xr" | "ai_chat";

export const useDialogs = create<{
  set: (dialog: Dialogs | undefined) => void;
  shown: Dialogs | undefined;
  toggle: (dialog: Dialogs) => void;
}>((set) => ({
  set: (shown) => set({ shown }),
  shown: undefined,
  toggle: (dialog) =>
    set((state) => ({ shown: state.shown === dialog ? undefined : dialog })),
}));
