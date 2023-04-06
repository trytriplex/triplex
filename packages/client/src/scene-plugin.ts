import { scripts } from "./templates";

export function scenePlugin({
  components,
  files,
}: {
  components: string[];
  files: string[];
}) {
  const sceneFrameId = "triplex:scene-frame.tsx";
  const availableComponentsId = "triplex:components";

  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    resolveId(id: string) {
      if (id === sceneFrameId) {
        return sceneFrameId;
      }

      if (id === availableComponentsId) {
        return availableComponentsId;
      }
    },
    async load(id: string) {
      if (id === sceneFrameId) {
        return scripts.sceneFrame.replace(
          "{{SCENE_FILES_GLOB}}",
          `[${files.map((f) => `'${f.replace(process.cwd(), "")}'`).join(",")}]`
        );
      }

      if (id === availableComponentsId) {
        return scripts.availableComponents.replace(
          "{{COMPONENTS_FILE_GLOB}}",
          `[${components
            .map((f) => `'${f.replace(process.cwd(), "")}'`)
            .join(",")}]`
        );
      }
    },
  } as const;
}
