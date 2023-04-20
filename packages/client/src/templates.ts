export const scripts = {
  editor: `
    import { createElement } from "react";
    import { createRoot } from "react-dom/client";
    import { Editor } from "@triplex/editor";
    import 'triplex:styles.css';

    createRoot(document.getElementById("root")).render(
      createElement(Editor)
    );
  `,
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
};

export const createHTML = (title: string, entry: "scene" | "editor") => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${scripts[entry]}
    </script>
  </body>
</html>
`;
