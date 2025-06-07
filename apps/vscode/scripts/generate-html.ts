/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadingLogo } from "@triplex/lib/loader";
import { rootHTML } from "@triplex/lib/templates";

async function generate() {
  await writeFile(
    join(__dirname, "..", "index.html"),
    rootHTML({
      loadingIndicator: loadingLogo({
        position: "splash",
        variant: "stroke",
      }),
      script: `import "@triplex/editor-next/vsce";`,
      title: "Triplex",
    }),
  );
}

generate();
