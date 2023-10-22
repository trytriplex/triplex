/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { exec } = require("node:child_process");

const script = process.argv[2];
const path = require.resolve(script);

exec(`pnpm -r exec node ${path}`);
