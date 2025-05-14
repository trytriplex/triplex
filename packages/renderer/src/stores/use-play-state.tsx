/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on } from "@triplex/bridge/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const PlayStateContext = createContext("edit");

export type PlayState = "edit" | "play" | "pause";

export function usePlayState() {
  return useContext(PlayStateContext);
}

export function PlayStateProvider({ children }: { children: ReactNode }) {
  const [playState, setPlayState] = useState<PlayState>("edit");

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      setPlayState(state);
    });
  }, []);

  return (
    <PlayStateContext.Provider value={playState}>
      {children}
    </PlayStateContext.Provider>
  );
}
