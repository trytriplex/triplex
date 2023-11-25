/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const suffix = "ta.hot";
const metaHot = "imp" + "ort.me" + suffix;
/**
 * We set aside a static amount of virtual modules to be used when creating new
 * files. If someone tries to create over this limit they won't see anything in
 * their scene until they save. We're choosing 10 as the arbitrary number for
 * now.
 */
const placeholderFiles = 10;

export const scripts = {
  defaultProvider: `export default function Fragment({children}){return children;}`,
  // Hides vite-ignored dynamic import so that Vite can skip analysis if no other
  // dynamic import is present (https://github.com/vitejs/vite/pull/12732)
  dynamicImportHMR: `export const __hmr_import = (url) => import(/* @vite-ignore */ url);`,
  // If the exports change, or if triplex meta changes, invalidate HMR
  // and force parents up the chain to refresh flushing changes through the editor
  // when the provider has changed - we want to flush it through the whole app!
  invalidateHMRFooter: (providerPath: string) => `
    if (${metaHot}) {
      __hmr_import(import.meta.url).then((currentModule) => {
        ${metaHot}.accept((nextModule) => {
          if (import.meta.url.includes("${providerPath}")){${metaHot}.invalidate();return;}
          const currentKeys = globalThis.Object.entries(currentModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          const nextKeys = globalThis.Object.entries(nextModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          if (JSON.stringify(currentKeys) !== JSON.stringify(nextKeys)){${metaHot}.invalidate();}
        });
      });
    }
  `,
  invalidateHMRHeader: `import { __hmr_import } from "triplex:hmr-import";`,
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
    "const temps = {",
    Array(placeholderFiles)
      .fill(undefined)
      .map((_, i) => {
        const n = i || "";
        return `'/src/untitled${n}.tsx':() => import('triplex:/src/untitled${n}.tsx')`;
      }),
    "};",
    "const merged = {...temps,...scenes};",
    "export function Scene() {return <SceneFrame provider={Provider} scenes={merged} />}",
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
