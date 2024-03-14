/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import fs from "node:fs";
import { transformSync } from "@babel/core";
import type { Plugin } from "esbuild";
import babelPlugin from "./babel-plugin";

export const transformNodeModulesJSXPlugin: Plugin = {
  name: "example",
  setup(build) {
    const cache = new Map<
      string,
      { input: string; output: { contents: string } }
    >();

    build.onLoad({ filter: /\.js$/ }, (args) => {
      let input = fs.readFileSync(args.path, "utf8");
      let key = args.path;
      let value = cache.get(key);

      if (!value || value.input !== input) {
        let contents = input;

        if (input.match(/(\.createElement)|(jsx)|(jsxs)/)) {
          const result = transformSync(input, {
            plugins: [babelPlugin({ exclude: [] })],
          });

          contents = result?.code || input;
        }

        value = { input, output: { contents } };
        cache.set(key, value);
      }

      return value.output;
    });
  },
};
