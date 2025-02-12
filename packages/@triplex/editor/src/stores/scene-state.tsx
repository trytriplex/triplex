/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { create } from "zustand";

interface SceneState {
  __internalState: Record<string, Record<string, unknown>>;
  clear(key: string): void;
  get(key: string): Record<string, unknown>;
  hasState(key: string): boolean;
  set(key: string, name: string, value: unknown): void;
}

export const useSceneState = create<SceneState>((setStore, get) => ({
  __internalState: {},
  clear(key) {
    const current = get();
    setStore({
      __internalState: {
        ...current.__internalState,
        [key]: {},
      },
    });
  },
  get(key) {
    const current = get();
    return current.__internalState[key] || {};
  },
  hasState(key) {
    const current = get();
    return Object.keys(current.__internalState[key] || {}).length > 0;
  },
  set(key, name, value) {
    const current = get();
    const nextValue = {
      __internalState: {
        ...current.__internalState,
        [key]: {
          ...current.__internalState[key],
          [name]: value,
        },
      },
    };

    if (value === undefined) {
      delete nextValue.__internalState[key][name];
    }

    setStore(nextValue);
  },
}));
