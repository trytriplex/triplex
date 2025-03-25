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
    join(__dirname, "..", "loading.html"),
    rootHTML({
      loadingIndicator: loadingLogo({
        color: "white",
        position: "splash",
        variant: "idle",
      }),
      title: "Loading Triplex...",
    }),
  );

  await writeFile(
    join(__dirname, "..", "index.html"),
    rootHTML({
      loadingIndicator: loadingLogo({
        color: "white",
        position: "splash",
        variant: "stroke",
      }),
      module: "./src/index.tsx",
      title: "Triplex",
    }),
  );

  await writeFile(
    join(__dirname, "..", "fallback-error.html"),
    rootHTML({
      module: "./src/fallback-error.tsx",
      title: "Error Loading Triplex",
    }),
  );

  await writeFile(
    join(__dirname, "..", "welcome.html"),
    rootHTML({
      module: "./src/welcome.tsx",
      title: "Triplex",
    }),
  );
}

generate();
