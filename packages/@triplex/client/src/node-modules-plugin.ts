/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import fs from "node:fs/promises";
import { transformSync } from "@babel/core";
import type { Plugin } from "esbuild";
import babelPlugin from "./babel-plugin";

const packagesToTransform = ["@react-three", "ecctrl"];

export const transformNodeModulesJSXPlugin = (): Plugin => ({
  name: "example",
  setup(build) {
    const cache = new Map<
      string,
      { input: string; output: { contents: string } }
    >();

    build.onLoad(
      { filter: new RegExp(packagesToTransform.join("|")) },
      async (args) => {
        let input = await fs.readFile(args.path, "utf8");
        let key = args.path;
        let value = cache.get(key);

        if (!value || value.input !== input) {
          let contents = input;

          if (/(\.createElement\()|(jsx\()|(jsxs\()/.test(input)) {
            const result = transformSync(input, {
              plugins: [babelPlugin({ exclude: [], skipFunctionMeta: true })],
            });

            contents = result?.code || input;
          }

          value = { input, output: { contents } };
          cache.set(key, value);
        }

        return value.output;
      },
    );
  },
});
