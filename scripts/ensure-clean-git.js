/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { spawnSync } = require("node:child_process");

const { output, status } = spawnSync("git diff --exit-code", {
  shell: true,
});

if (status !== null && status !== 0) {
  // eslint-disable-next-line no-console
  console.error(
    `
===== Unexpected Uncommitted Changes =====
${output.join("\n").trim()}
==========================================
`,
  );
  process.exit(1);
}
