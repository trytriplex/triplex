/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { compose, on, send } from "@triplex/bridge/host";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import invariant from "tiny-invariant";
import {
  type PlayState,
  type PlayStateAction,
  type SceneContext,
  type SceneEvents,
  type SceneSelected,
} from "./types";

const SceneEventsContext = createContext<SceneEvents | null>(null);
const SceneContextContext = createContext<SceneContext | null>(null);
const PlayStateContext = createContext<PlayState | null>(null);
const SceneSelectedContext = createContext<SceneSelected | undefined>(
  undefined,
);

function playStateReducer(
  state: PlayState,
  action: PlayStateAction,
): PlayState {
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

export function useSceneEvents(): SceneEvents {
  const value = useContext(SceneEventsContext);
  invariant(
    value,
    "useSceneEvents() must be used within the SceneProvider component.",
  );
  return value;
}

export function useSceneContext(): SceneContext {
  const value = useContext(SceneContextContext);
  invariant(
    value,
    "useSceneContext() must be used within the SceneProvider component.",
  );
  return value;
}

export function useScenePlayState(): PlayState {
  const value = useContext(PlayStateContext);
  invariant(
    value,
    "useScenePlayState() must be used within the SceneProvider component.",
  );
  return value;
}

export function useSceneSelected(): SceneSelected | undefined {
  return useContext(SceneSelectedContext);
}

export function SceneContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [playState, setPlayState] = useReducer(playStateReducer, {
    camera: "default",
    state: "edit",
  });
  const [selected, syncSelected] = useState<SceneSelected | undefined>(
    undefined,
  );
  const [context, syncContext] = useState<SceneContext>(
    window.triplex.initialState,
  );

  const events: SceneEvents = {
    blurElement: () => send("request-blur-element", undefined),
    focusElement: (data) => send("request-focus-element", data),
    setPlayState,
    syncContext,
    syncSelected,
  };

  useEffect(() => {
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
  }, []);

  return (
    <SceneEventsContext.Provider value={events}>
      <SceneContextContext.Provider value={context}>
        <PlayStateContext.Provider value={playState}>
          <SceneSelectedContext.Provider value={selected}>
            {children}
          </SceneSelectedContext.Provider>
        </PlayStateContext.Provider>
      </SceneContextContext.Provider>
    </SceneEventsContext.Provider>
  );
}
