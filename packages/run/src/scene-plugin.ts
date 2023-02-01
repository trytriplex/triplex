import { watch } from "chokidar";
import { addRefreshWrapper } from "./hmr-hacks";

const globModuleId = "triplex:scenes.ts";
const sceneHmrId = "triplex:scene-frame.tsx";
const virtual = (str: string) => "\0" + str;

export function scenePlugin({
  tempDir,
}: {
  tempDir: string;
}): import("vite").Plugin {
  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    configureServer(server) {
      function reloadGlobModule() {
        server.moduleGraph.fileToModulesMap.forEach((mods) => {
          mods.forEach((mod) => {
            if (mod.id === virtual(globModuleId)) {
              server.reloadModule(mod);
            }
          });
        });
      }

      const watcher = watch(tempDir);
      watcher.on("add", reloadGlobModule);
    },
    resolveId(id: string) {
      if (id === globModuleId) {
        return virtual(globModuleId);
      }

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
            import { scenes } from "triplex:scenes.ts";
            
            const scenes = import.meta.glob('@@/**/*');

            export function Scene() {
            return <SceneFrame scenes={scenes} />;
            }
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
