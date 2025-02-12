/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require("node:child_process");

const script = process.argv[2];
const path = require.resolve(script);

exec(`pnpm -r exec node ${path}`);
