/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, useContext } from "react";
import { ComponentModule, SceneModule } from "./types";

const ComponentContext = createContext<Record<
  string,
  () => Promise<ComponentModule>
> | null>(null);

const SceneContext = createContext<Record<
  string,
  () => Promise<SceneModule>
> | null>(null);

export function useComponents() {
  const components = useContext(ComponentContext);
  if (!components) {
    throw new Error("invariant: could not find triplex component context");
  }

  return components;
}

export function useScenes() {
  const scenes = useContext(SceneContext);
  if (!scenes) {
    throw new Error("invariant: could not find triplex scene context");
  }

  return scenes;
}

export const ComponentProvider = ComponentContext.Provider;
export const SceneProvider = SceneContext.Provider;
