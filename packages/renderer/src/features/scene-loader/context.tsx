/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createContext, useContext } from "react";
import { type LoadedSceneContext } from "./types";

/**
 * SceneContext is used to pass the loaded scene down into other components
 * without having to define props. Canvas for example may be defined by a user
 * and it still needs to render all of our scene components.
 */
export const SceneContext = createContext<LoadedSceneContext | null>(null);

export const ResetCountContext = createContext(0);

export function useLoadedScene() {
  const value = useContext(SceneContext);
  if (!value) {
    throw new Error("invariant");
  }

  return value;
}
