import { scripts } from "./templates";

export function scenePlugin({
  cwd,
  components,
  files,
}: {
  cwd: string;
  components: string[];
  files: string[];
}) {
  const sceneFrameId = "triplex:scene-frame.tsx";
  const hmrImportId = "triplex:hmr-import";

  return {
    name: "triplex:scene-glob-plugin",
    enforce: "pre",
    resolveId(id: string) {
      if (id === sceneFrameId) {
        return sceneFrameId;
      }

      if (id === hmrImportId) {
        // Return the id as a virtual module so no other plugins transform it.
        return "\0" + hmrImportId;
      }
    },
    async load(id: string) {
      if (id === sceneFrameId) {
        // TODO: Users should be able to specify what node modules they want to make available.
        const nodeImports = ["@react-three/drei"];

        return scripts.sceneFrame
          .replace(
            "{{SCENE_FILES_GLOB}}",
            `[${files
              .map((f) => `'${f.replace(cwd.replaceAll("\\", "/"), "")}'`)
              .join(",")}]`
          )
          .replace(
            "{{COMPONENTS_FILE_GLOB}}",
            `[${components
              .map((f) => `'${f.replace(cwd.replaceAll("\\", "/"), "")}'`)
              .join(",")}]`
          )
          .replace(
            "{{NODE_IMPORTS}}",
            `{
            ${nodeImports
              .map((imp) => `'${imp}': () => import('${imp}')`)
              .join(",")}
            }`
          );
      }

      if (id === "\0" + hmrImportId) {
        return scripts.dynamicImportHMR;
      }
    },
    transform(code: string, id: string) {
      if (id.includes("/node_modules/")) {
        // Skip node modules
        return;
      }

      const [filepath] = id.split("?");
      if (!filepath.endsWith(".tsx")) {
        // Skip non-tsx files.
        return;
      }

      // This forces modules with JSX to invalidate themselves if their exports change.
      // This will force the triplex:scene-frame.tsx virtual module to load itself again
      // Thus flushing the editor with the new (or removed!) export/s.
      return scripts.invalidateHMRHeader + code + scripts.invalidateHRMFooter;
    },
  } as const;
}
