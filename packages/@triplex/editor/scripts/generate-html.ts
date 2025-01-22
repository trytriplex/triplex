/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { writeFile } from "node:fs/promises";
import { loadingLogo } from "@triplex/lib/loader";
import { rootHTML } from "@triplex/lib/templates";
import { join } from "upath";

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
