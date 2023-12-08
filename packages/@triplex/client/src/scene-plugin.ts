/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { emptyProviderId, hmrImportId } from "./constants";
import { scripts } from "./templates";

export function scenePlugin({ provider }: { provider: string }) {
  return {
    enforce: "pre",
    async load(id: string) {
      if (id === emptyProviderId) {
        return scripts.defaultProvider;
      }

      if (id === "\0" + hmrImportId) {
        return scripts.dynamicImportHMR;
      }
    },
    name: "triplex:scene-plugin",
    resolveId(id: string) {
      if (id === hmrImportId) {
        // Return the id as a virtual module so no other plugins transform it.
        return "\0" + hmrImportId;
      }

      if (id === emptyProviderId) {
        return emptyProviderId;
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
      return (
        scripts.invalidateHMRHeader +
        code +
        scripts.invalidateHMRFooter(provider.replace(process.cwd(), ""))
      );
    },
  } as const;
}
