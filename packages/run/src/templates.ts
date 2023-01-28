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
      import "@triplex/run/${entry}";
    </script>
  </body>
</html>
`;
