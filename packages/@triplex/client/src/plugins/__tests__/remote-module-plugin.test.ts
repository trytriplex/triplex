/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";
import { describe, expect, it } from "vitest";
import { remoteModulePlugin } from "../remote-module-plugin";

describe("virtual plugin", () => {
  it("should do nothing when loading files not considered a scene component", async () => {
    const plugin = remoteModulePlugin({
      cwd: __dirname,
      files: [join(__dirname, "fixtures/*")],
      ports: { client: 3333, server: 3333, ws: 3333 },
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
      ports: { client: 3333, server: 3333, ws: 3333 },
    });

    const actual = await plugin.load?.(
      join(__dirname, "fixtures", "index.tsx"),
    );

    expect(actual).toEqual("code");
  });
});
