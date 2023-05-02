export const scripts = {
  scene: `
    import { createElement } from "react";
    import { createRoot } from "react-dom/client";
    import { Scene } from "triplex:scene-frame.tsx";

    createRoot(document.getElementById("root")).render(
      createElement(Scene)
    );
  `,
  sceneFrame: `
    import { Scene as SceneFrame } from "@triplex/scene";

    const scenes = import.meta.glob({{SCENE_FILES_GLOB}});
    const components = import.meta.glob({{COMPONENTS_FILE_GLOB}});

    export function Scene() {
      return <SceneFrame components={components} scenes={scenes} />;
    }
  `,
  // Hides vite-ignored dynamic import so that Vite can skip analysis if no other
  // dynamic import is present (https://github.com/vitejs/vite/pull/12732)
  dynamicImportHMR: `
    export const __hmr_import = (url) => import(/* @vite-ignore */ url);
  `,
  invalidateHMRHeader: `
    import { __hmr_import } from "triplex:hmr-import";
  `,
  invalidateHRMFooter: `
    if (import.meta.hot) {
      __hmr_import(import.meta.url).then((currentModule) => {
        import.meta.hot.accept((nextModule) => {
          const currentKeys = Object
            .entries(currentModule)
            .map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key)
            .sort();
          const nextKeys = Object
            .entries(nextModule)
            .map(([key, value]) => typeof value.triplexMeta ? key + JSON.stringify(value.triplexMeta) : key)
            .sort();

          if (JSON.stringify(currentKeys) !== JSON.stringify(nextKeys)) {
            // If the exports change, or if triplex meta changes, invalidate HMR
            // And force parents up the chain to refresh flushing changes through
            // The editor.
            import.meta.hot.invalidate();
          }
        });
      });
    }
  `,
};

export const createHTML = (title: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="script-src 'self'; worker-src blob:;">
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${scripts.scene}
    </script>
  </body>
</html>
`;
