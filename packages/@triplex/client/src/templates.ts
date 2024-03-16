/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type ReconciledTriplexConfig,
  type TriplexPorts,
} from "@triplex/server";

const suffix = "ta.hot";
const metaHot = "imp" + "ort.me" + suffix;
/**
 * We set aside a static amount of virtual modules to be used when creating new
 * files. If someone tries to create over this limit they won't see anything in
 * their scene until they save. We're choosing 10 as the arbitrary number for
 * now.
 */
const placeholderFiles = 10;

interface TemplateOpts {
  config: ReconciledTriplexConfig;
  fileGlobs: string[];
  pkgName: string;
  ports: TriplexPorts;
}

export const scripts = {
  bootstrap: (template: TemplateOpts) =>
    [
      `import { bootstrap } from "${template.pkgName}";`,
      `import provider from "${template.config.provider}";`,
      'import { on, send } from "@triplex/bridge/client";',
      `const projectFiles = import.meta.glob([${template.fileGlobs}]);`,
      `window.triplex = JSON.parse(\`${JSON.stringify({
        env: { ports: template.ports },
        renderer: { attributes: template.config.rendererAttributes },
      })}\`);`,
      "const tempFiles = {",
      Array(placeholderFiles)
        .fill(undefined)
        .map((_, i) => {
          const n = i || "";
          return `'/src/untitled${n}.tsx':() => import('triplex:/src/untitled${n}.tsx')`;
        }),
      "};",
      `
      const files = Object.assign(tempFiles, projectFiles);

      // Need to export for HMR support later down the template.
      export { provider, files };

      if (${metaHot}) {
        ${metaHot}.on("vite:error", (e) => {
          send("error", {
            title: "Could not parse file",
            subtitle: "The scene could not be rendered as there was an error parsing its file. Resolve syntax errors and try again.",
            message: e.err.message,
            col: e.err.loc?.column,
            line: e.err.loc?.line,
            stack: e.err.stack,
            source: e.err.id,
          });
        });

        ${metaHot}.on("vite:afterUpdate", (e) => {
          const paths = e.updates.map((update) => update.path);

          paths.forEach((path) => {
            send("self:request-reset-file", { path });
          });
        });

        if (!${metaHot}.data.render) {
          window.addEventListener("error", (e) => {
            requestAnimationFrame(() => {
              // Flush this error one frame later to ensure any duplicate errors
              // sent from the renderer get prioritized over this generic one.
              send("error", {
                col: e.colno,
                line: e.lineno,
                title: "Could not run code",
                subtitle: "There was an error which may have affected the rendering of your scene. Resolve any errors and try again.",
                message: e.error.message,
                source: e.filename,
                stack: e.error.stack,
              });
            });
          });

          ${metaHot}.data.render = bootstrap(document.getElementById('root'));
          ${metaHot}.data.render({ config: ${JSON.stringify(
        template.config
      )}, files, provider });

          on("request-refresh-scene", (data) => {
            if (data.hard) {
              window.location.reload();
            }
          });
        }

        ${metaHot}.accept((mod) => {
          if (mod) {
            ${metaHot}.data.render({ config: ${JSON.stringify(
        template.config
      )}, files: mod.files, provider: mod.provider });
          }
        });
      }
      `,
    ].join(""),
  defaultProvider: `export default function Fragment({children}){return children;}`,
  // Hides vite-ignored dynamic import so that Vite can skip analysis if no other
  // dynamic import is present (https://github.com/vitejs/vite/pull/12732)
  dynamicImportHMR: `export const __hmr_import = (url) => import(/* @vite-ignore */ url);`,
  // If the exports change, or if triplex meta changes, invalidate HMR
  // and force parents up the chain to refresh flushing changes through the editor
  // when the provider has changed - we want to flush it through the whole app!
  invalidateHMRFooter: (providerModule: string) => `
    if (${metaHot}) {
      __hmr_import(import.meta.url).then((currentModule) => {
        ${metaHot}.accept((nextModule) => {
          if (import.meta.url.includes("${providerModule}")){${metaHot}.invalidate();return;}
          const currentKeys = globalThis.Object.entries(currentModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          const nextKeys = globalThis.Object.entries(nextModule).map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key).sort();
          if (JSON.stringify(currentKeys) !== JSON.stringify(nextKeys)){${metaHot}.invalidate();}
        });
      });
    }
  `,
  invalidateHMRHeader: `import { __hmr_import } from "triplex:hmr-import";`,
  thumbnail: (
    template: TemplateOpts,
    { exportName, path }: { exportName: string; path: string }
  ) =>
    [
      `import { thumbnail } from "${template.pkgName}";`,
      `import provider from "${template.config.provider}";`,
      `import {${exportName} as component} from "${path}";`,
      `thumbnail(document.getElementById('root'))({ component, provider });`,
    ].join(""),
};

export const loading = () => `
<div style="align-items:center;bottom:12px;display:flex;height:50px;justify-content:center;pointer-events:none;position:fixed;right:12px;width:50px;">
  <style>
  .loading--animate-dashes {
    stroke-dasharray: 25;
    animation: dash 1.4s linear infinite;
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 100;
    }
  }
  </style>
  <svg height="33" viewBox="0 0 33 33" width="33">
    <defs>
      <linearGradient id="l-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="rgb(245 245 245)" />
        <stop offset="100%" stop-color="rgb(163 163 163)" />
      </linearGradient>
    </defs>
    <polygon
      class="loading--animate-dashes"
      fill="none"
      points="16,1 32,32 1,32"
      stroke="url(#l-gradient)"
      stroke-width="2"
    />
  </svg>
</div>
`;

export const createHTML = (script: string, opts?: { initial: string }) =>
  [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "<title>Triplex</title>",
    "</head>",
    "<body>",
    `<div id="root">${opts?.initial || ""}</div>`,
    '<script type="module">',
    script,
    "</script>",
    "</body>",
    "</html>",
  ].join("");
