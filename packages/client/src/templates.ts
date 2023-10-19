/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const suffix = "ta.hot";
const metaHot = "imp" + "ort.me" + suffix;

export const scripts = {
  defaultProvider: `export default function Fragment({children}){return children;}`,
  // Hides vite-ignored dynamic import so that Vite can skip analysis if no other
  // dynamic import is present (https://github.com/vitejs/vite/pull/12732)
  dynamicImportHMR: `export const __hmr_import = (url) => import(/* @vite-ignore */ url);`,
  invalidateHMRHeader: `import { __hmr_import } from "triplex:hmr-import";`,
  // If the exports change, or if triplex meta changes, invalidate HMR
  // And force parents up the chain to refresh flushing changes through
  // The editor.
  // When the provider has changed - we want to flush it through the whole app.
  invalidateHRMFooter: (providerPath: string) => `
    if (${metaHot}) {
      __hmr_import(import.meta.url).then((currentModule) => {
        ${metaHot}.accept((nextModule) => {
          if (import.meta.url.includes("${providerPath}")){${metaHot}.invalidate();return;}
          const currentKeys = Object.entries(currentModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          const nextKeys = Object.entries(nextModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          if (JSON.stringify(currentKeys) !== JSON.stringify(nextKeys)){${metaHot}.invalidate();}
        });
      });
    }
  `,
  scene: [
    'import {createElement} from "react";',
    'import {createRoot} from "react-dom/client";',
    'import {Scene} from "triplex:scene-frame.tsx";',
    'createRoot(document.getElementById("root")).render(createElement(Scene));',
  ].join(""),
  sceneFrame: [
    'import { Scene as SceneFrame } from "@triplex/scene";',
    'import Provider from "{{PROVIDER_PATH}}";',
    "const scenes = import.meta.glob({{SCENE_FILES_GLOB}});",
    "const localImports = import.meta.glob({{COMPONENTS_FILE_GLOB}});",
    "const nodeImports = {{NODE_IMPORTS}};",
    "const components = {...localImports,...nodeImports };",
    "export function Scene() {return <SceneFrame provider={Provider} components={components} scenes={scenes} />}",
  ].join(""),
};

export const createHTML = () =>
  [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "<title>Triplex</title>",
    "</head>",
    "<body>",
    '<div id="root"></div>',
    '<script type="module">',
    `${scripts.scene}`,
    "</script>",
    "</body>",
    "</html>",
  ].join("");
