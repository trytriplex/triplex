import { scripts } from "./templates";

export function scenePlugin({ files }: { files: string[] }) {
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
        return scripts.sceneFrame.replace(
          "{{SCENE_FILES_GLOB}}",
          `[${files.map((f) => `'${f.replace(process.cwd(), "")}'`).join(",")}]`
        );
      }
    },
  } as const;
}
