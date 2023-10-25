/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { remoteModulePlugin } from "../remote-module-plugin";

describe("virtual plugin", () => {
  it("should do nothing when loading files not considered a scene component", async () => {
    const plugin = remoteModulePlugin({
      cwd: __dirname,
      files: [join(__dirname, "fixtures/*")],
    });

    const actual = await plugin.load?.(join(__dirname, "outside"));

    expect(actual).toBeUndefined();
  });

  it("should return code when matching a scene component", async () => {
    const plugin = remoteModulePlugin({
      __api: {
        getCode: async (id) => (id.endsWith("index.tsx") ? "code" : ""),
      },
      cwd: __dirname,
      files: [join(__dirname, "fixtures/*")],
    });

    const actual = await plugin.load?.(
      join(__dirname, "fixtures", "index.tsx")
    );

    expect(actual).toEqual("code");
  });
});
