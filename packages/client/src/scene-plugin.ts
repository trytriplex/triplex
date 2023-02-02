import { addRefreshWrapper } from "./hmr-hacks";
import { scripts } from "./templates";

const sceneFrameId = "triplex:scene-frame.tsx";
const virtual = (str: string) => "\0" + str;

// @ts-ignore
export function scenePlugin(): import("vite").Plugin {
  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    resolveId(id: string) {
      if (id === sceneFrameId) {
        return virtual(sceneFrameId);
      }
    },
    async load(id: string) {
      const { transformWithEsbuild } = await import("vite");

      if (id === virtual(sceneFrameId)) {
        const result = await transformWithEsbuild(
          scripts.sceneFrame,
          sceneFrameId,
          { loader: "tsx" }
        );

        return {
          ...result,
          code: addRefreshWrapper(result.code, id),
        };
      }
    },
  } as const;
}
