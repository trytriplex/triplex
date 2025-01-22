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
    join(__dirname, "..", "index.html"),
    rootHTML({
      loadingIndicator: loadingLogo({
        position: "splash",
        variant: "stroke",
      }),
      module: "./src/app/index.tsx",
      title: "Triplex",
    }),
  );
}

generate();
