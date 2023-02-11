import { create } from "zustand";

export interface FocusedObject {
  path: string;
  line: number;
  column: number;
  name: string;
}

interface SceneState {
  focus: (obj: FocusedObject | null) => void;
  focused: FocusedObject | null;
}

export const useSceneStore = create<SceneState>((set) => ({
  focused: null,
  focus: (sceneObject) => set({ focused: sceneObject }),
}));
