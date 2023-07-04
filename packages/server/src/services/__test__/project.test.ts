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
import { join } from "path";

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
        path: join(__dirname, "__mocks__", "components"),
        name: "components",
        files: 2,
        children: [
          {
            files: 1,
            path: join(__dirname, "__mocks__", "components", "materials"),
            name: "materials",
            children: [
              {
                files: 1,
                path: join(
                  __dirname,
                  "__mocks__",
                  "components",
                  "materials",
                  "water"
                ),
                name: "water",
                children: [
                  {
                    files: 1,
                    path: join(
                      __dirname,
                      "__mocks__",
                      "components",
                      "materials",
                      "water",
                      "concrete"
                    ),
                    name: "concrete",
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            files: 2,
            path: join(__dirname, "__mocks__", "components", "objects"),
            name: "objects",
            children: [],
          },
        ],
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
        type: "custom",
        path: join(
          __dirname,
          "__mocks__",
          "components",
          "objects",
          "default.tsx"
        ),
      },
      {
        category: "Unknown",
        exportName: "Sphere",
        name: "Sphere",
        type: "custom",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
      },
      {
        category: "Unknown",
        exportName: "default",
        name: "Box",
        type: "custom",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
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
        name: "default.tsx",
        path: join(
          __dirname,
          "__mocks__",
          "components",
          "objects",
          "default.tsx"
        ),
        extname: ".tsx",
        type: "asset",
      },
      {
        name: "test.tsx",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
        extname: ".tsx",
        type: "asset",
      },
    ]);
  });
});
