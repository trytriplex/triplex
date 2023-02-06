import { create } from "zustand";

interface SceneState {
  focus: (obj: { path: string; line: number; column: number } | null) => void;
  focused: { path: string; line: number; column: number } | null;
}

export const useSceneStore = create<SceneState>((set) => ({
  focused: null,
  focus: (sceneObject) => set({ focused: sceneObject }),
}));
