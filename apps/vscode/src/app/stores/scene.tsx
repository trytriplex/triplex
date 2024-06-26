/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, send } from "@triplex/bridge/host";
import { useCallback } from "react";
import { create } from "zustand";

export interface ElementLocation {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}
export type PlayStateAction =
  | "camera-default"
  | "camera-editor"
  | "state-play"
  | "state-pause"
  | "state-edit";

export interface PlayState {
  camera: "default" | "editor";
  state: "play" | "pause" | "edit";
}

export interface SceneStore {
  blurElement(): void;
  context: {
    exportName: string;
    path: string;
  };
  focusElement(selected: ElementLocation): void;
  playState: PlayState;
  selected: ElementLocation | undefined;
  setPlayState(action: PlayStateAction): void;
  syncContext(ctx: SceneStore["context"]): void;
  syncSelected(selected: SceneStore["selected"]): void;
}

function playReducer(state: PlayState, action: PlayStateAction): PlayState {
  switch (action) {
    case "camera-default":
      return { ...state, camera: "default" };

    case "camera-editor":
      return { ...state, camera: "editor" };

    case "state-play":
      return { ...state, state: "play" };

    case "state-pause":
      return { ...state, state: "pause" };

    case "state-edit":
      return { ...state, state: "edit" };

    default:
      return state;
  }
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  blurElement: () => send("request-blur-element", undefined),
  context: window.triplex.initialState,
  focusElement: (data) => send("request-focus-element", data),
  playState: { camera: "editor", state: "edit" },
  selected: undefined,
  setPlayState: (action: PlayStateAction) =>
    set({ playState: playReducer(get().playState, action) }),
  syncContext: (ctx) => set({ context: ctx }),
  syncSelected: (selected) => set({ selected }),
}));

export function useInitSceneSync() {
  const syncSelected = useSceneStore((store) => store.syncSelected);

  const init = useCallback(() => {
    return compose([
      on("element-blurred", syncSelected),
      on("element-focused", syncSelected),
      on("ready", () => {
        send("request-open-component", {
          encodedProps: "",
          exportName: window.triplex.initialState.exportName,
          path: window.triplex.initialState.path,
        });
      }),
    ]);
  }, [syncSelected]);

  return init;
}
