#!/usr/bin/env node
/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("ts-node").register({ project: __dirname + "/tsconfig.json" });

process.env.TRIPLEX_ENV = "development";
process.env.VITE_TRIPLEX_ENV = process.env.VITE_TRIPLEX_ENV || "development";

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("./src/main.ts");
