/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function rootHTML({
  loadingIndicator = "",
  module,
  script,
  title,
}: {
  loadingIndicator?: string;
  module?: string;
  script?: string;
  title: string;
}) {
  return `<!-- THIS FILE IS GENERATED DO NOT MODIFY -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>html,body,#root{margin:0;height:100%;min-height:100%;}</style>
    </head>
    <body>
        <div id="root">${loadingIndicator}</div>
        ${module ? `<script type="module" src="${module}"></script>` : ""}
        ${script ? `<script type="module">${script}</script>` : ""}
    </body>
</html>
`;
}
