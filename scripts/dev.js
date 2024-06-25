/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { spawn } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("upath");

const examples = readdirSync(join(process.cwd(), "examples"));
const example = process.argv[2] || "geometry";

if (!examples.includes(example)) {
  // eslint-disable-next-line no-console
  console.error(
    `
"${example}" is not an available example of [${examples.join(", ")}]
`,
  );
} else {
  spawn("npx", ["triplex", "editor"], {
    cwd: join(process.cwd(), "examples", example),
    stdio: "inherit",
  });
}
