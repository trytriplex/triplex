#!/usr/bin/env node
/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
require("ts-node").register({ project: __dirname + "/tsconfig.json" });

process.env.TRIPLEX_ENV = "development";

require("./src/index.ts");
