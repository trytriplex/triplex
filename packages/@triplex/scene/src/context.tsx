/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Modules } from "@triplex/bridge/client";
import { createContext, useContext } from "react";

const SceneContext = createContext<Modules | null>(null);

export function useScenes() {
  const scenes = useContext(SceneContext);
  if (!scenes) {
    throw new Error("invariant: could not find triplex scene context");
  }

  return scenes;
}

export const SceneProvider = SceneContext.Provider;
