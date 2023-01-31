const scripts = {
  scene: `
    import { Scene } from "@triplex/run/scene";
    import { createElement } from "react";
    import { createRoot } from "react-dom/client";

    createRoot(document.getElementById("root")).render(
      createElement(Scene)
    );
  `,
  editor: `
    import { Editor } from "@triplex/run/editor";
    import { createElement } from "react";
    import { createRoot } from "react-dom/client";

    createRoot(document.getElementById("root")).render(
      createElement(Editor)
    );
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
  <body style="margin: 0; padding: 0">
    <div id="root"></div>
    <script type="module">
      ${scripts[entry]}
    </script>
  </body>
</html>
`;
