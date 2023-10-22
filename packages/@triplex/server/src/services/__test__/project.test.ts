/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { describe, expect, it } from "vitest";
import {
  hostElements,
  foundFolders,
  folderComponents,
  folderAssets,
} from "../project";
import { join } from "node:path";

describe("project", () => {
  it("should return a list of host jsx elements", () => {
    const actual = hostElements();

    expect(actual.length).toEqual(46);
  });

  it("should pick up all folders that contain files in a nested structure", async () => {
    const actual = await foundFolders([
      __dirname + "/__mocks__/components/**/*.tsx",
    ]);

    expect(actual).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [],
                    files: 1,
                    name: "concrete",
                    path: join(
                      __dirname,
                      "__mocks__",
                      "components",
                      "materials",
                      "water",
                      "concrete"
                    ),
                  },
                ],
                files: 1,
                name: "water",
                path: join(
                  __dirname,
                  "__mocks__",
                  "components",
                  "materials",
                  "water"
                ),
              },
            ],
            files: 1,
            name: "materials",
            path: join(__dirname, "__mocks__", "components", "materials"),
          },
          {
            children: [],
            files: 2,
            name: "objects",
            path: join(__dirname, "__mocks__", "components", "objects"),
          },
        ],
        files: 2,
        name: "components",
        path: join(__dirname, "__mocks__", "components"),
      },
    ]);
  });

  it("should return a folders components", async () => {
    const actual = await folderComponents(
      [__dirname + "/__mocks__/components/**/*.tsx"],
      __dirname + "/__mocks__/components/objects"
    );

    expect(actual).toEqual([
      {
        category: "Unknown",
        exportName: "default",
        name: "Cylinder",
        path: join(
          __dirname,
          "__mocks__",
          "components",
          "objects",
          "default.tsx"
        ),
        type: "custom",
      },
      {
        category: "Unknown",
        exportName: "Sphere",
        name: "Sphere",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
        type: "custom",
      },
      {
        category: "Unknown",
        exportName: "default",
        name: "Box",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
        type: "custom",
      },
    ]);
  });

  it("should return a folders assets", async () => {
    const actual = await folderAssets(
      [__dirname + "/__mocks__/components/**/*.tsx"],
      __dirname + "/__mocks__/components/objects"
    );

    expect(actual).toEqual([
      {
        extname: ".tsx",
        name: "default.tsx",
        path: join(
          __dirname,
          "__mocks__",
          "components",
          "objects",
          "default.tsx"
        ),
        type: "asset",
      },
      {
        extname: ".tsx",
        name: "test.tsx",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
        type: "asset",
      },
    ]);
  });
});
