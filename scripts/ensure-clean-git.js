/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
