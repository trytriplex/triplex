/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { create } from "zustand";

interface SceneState {
  clear(key: string): void;
  set(key: string, name: string, value: unknown): void;
  get(key: string): Record<string, unknown>;
  hasState(key: string): boolean;
  __internalState: Record<string, Record<string, unknown>>;
}

export const useSceneState = create<SceneState>((setStore, get) => ({
  hasState(key) {
    const current = get();
    return Object.keys(current.__internalState[key] || {}).length > 0;
  },
  clear(key) {
    const current = get();
    setStore({
      __internalState: {
        ...current.__internalState,
        [key]: {},
      },
    });
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

    if (!value) {
      delete nextValue.__internalState[key][name];
    }

    setStore(nextValue);
  },
  get(key) {
    const current = get();
    return current.__internalState[key] || {};
  },
  __internalState: {},
}));
