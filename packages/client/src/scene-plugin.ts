/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { scripts } from "./templates";

const sceneFrameId = "triplex:scene-frame.tsx";
const emptyProviderId = "triplex:empty-provider.tsx";
const hmrImportId = "triplex:hmr-import";

export function scenePlugin({
  cwd,
  components,
  files,
  provider = emptyProviderId,
}: {
  cwd: string;
  components: string[];
  files: string[];
  provider: string | undefined;
}) {
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

      if (id === emptyProviderId) {
        return emptyProviderId;
      }
    },
    async load(id: string) {
      if (id === emptyProviderId) {
        return scripts.defaultProvider;
      }

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
          )
          .replace("{{PROVIDER_PATH}}", provider);
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
