/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
