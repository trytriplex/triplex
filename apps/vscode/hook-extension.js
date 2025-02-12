/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
require("ts-node").register({ project: __dirname + "/tsconfig.json" });

process.env.VITE_CJS_IGNORE_WARNING = true;
process.env.TRIPLEX_ENV = "development";
process.env.VITE_TRIPLEX_ENV = process.env.VITE_TRIPLEX_ENV || "development";

module.exports = require("./src/extension/index.ts");
