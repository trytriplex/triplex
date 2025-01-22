/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
    </head>
    <body>
        <div id="root">${loadingIndicator}</div>
        ${module ? `<script type="module" src="${module}"></script>` : ""}
        ${script ? `<script type="module">${script}</script>` : ""}
    </body>
</html>
`;
}
