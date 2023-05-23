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
    throw new Error(
      "invariant: Context not found, your installed packages have duplicates. See: https://triplex.dev/docs/supporting/context-not-found"
    );
  }

  return components;
}

export function useScenes() {
  const scenes = useContext(SceneContext);
  if (!scenes) {
    throw new Error(
      "invariant: Context could not be found, your installed packages have duplicates. See: https://triplex.dev/docs/supporting/context-not-found"
    );
  }

  return scenes;
}

export const ComponentProvider = ComponentContext.Provider;
export const SceneProvider = SceneContext.Provider;
