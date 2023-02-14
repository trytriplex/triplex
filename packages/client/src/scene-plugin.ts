import { scripts } from "./templates";

export function scenePlugin() {
  const sceneFrameId = "triplex:scene-frame.tsx";

  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    resolveId(id: string) {
      if (id === sceneFrameId) {
        return sceneFrameId;
      }
    },
    async load(id: string) {
      if (id === sceneFrameId) {
        return scripts.sceneFrame;
      }
    },
  } as const;
}
