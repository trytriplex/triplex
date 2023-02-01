import { addRefreshWrapper } from "./hmr-hacks";

const sceneHmrId = "triplex:scene-frame.tsx";
const virtual = (str: string) => "\0" + str;

// @ts-ignore
export function scenePlugin(): import("vite").Plugin {
  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    resolveId(id: string) {
      if (id === sceneHmrId) {
        return virtual(sceneHmrId);
      }
    },
    async load(id: string) {
      const { transformWithEsbuild } = await import("vite");

      if (id === virtual(sceneHmrId)) {
        const result = await transformWithEsbuild(
          `
            import { Scene as SceneFrame } from "@triplex/run/scene";

            const scenes = import.meta.glob('@@/**/*');

            export function Scene() {
              return <SceneFrame scenes={scenes} />;
            }

            // This is needed to make React use the new component.
            $RefreshReg$(Scene, "Scene");
          `,
          sceneHmrId,
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
