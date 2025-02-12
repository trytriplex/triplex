/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { scripts } from "./templates";
import { type InitializationConfig } from "./types";

const emptyProviderId = "triplex:empty-provider.jsx";
const globalProviderId = "triplex:global-provider.jsx";
const bootstrapModuleId = "triplex:bootstrap.tsx";
const hmrImportId = "triplex:hmr-import";

export function scenePlugin(template: InitializationConfig) {
  return {
    enforce: "pre",
    async load(id: string) {
      switch (id) {
        case "\0" + hmrImportId:
          return scripts.dynamicImportHMR;

        case bootstrapModuleId:
          return scripts.bootstrap(template);

        case emptyProviderId:
          return scripts.defaultProvider;

        case globalProviderId:
          return scripts.globalProviderModule(template);
      }
    },
    name: "triplex:scene-plugin",
    resolveId(id: string) {
      switch (id) {
        case hmrImportId:
          // Return the id as a virtual module so no other plugins transform it.
          return "\0" + hmrImportId;

        case bootstrapModuleId:
        case emptyProviderId:
        case globalProviderId:
          return id;
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
      return scripts.invalidateHMRHeader + code + scripts.invalidateHMRFooter;
    },
  } as const;
}
