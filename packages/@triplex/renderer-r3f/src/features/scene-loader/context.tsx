/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { createContext, useContext } from "react";
import { type LoadedSceneContext } from "./types";

/**
 * SceneContext is used to pass the loaded scene down into other components
 * without having to define props. Canvas for example may be defined by a user
 * and it still needs to render all of our scene components.
 */
export const SceneContext = createContext<LoadedSceneContext | null>(null);

export function useLoadedScene() {
  const value = useContext(SceneContext);
  if (!value) {
    throw new Error("invariant");
  }

  return value;
}
