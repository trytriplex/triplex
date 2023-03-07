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

    export function Scene() {
      return <SceneFrame scenes={scenes} />;
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Karla:wght@200;300;400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${scripts[entry]}
    </script>
  </body>
</html>
`;
