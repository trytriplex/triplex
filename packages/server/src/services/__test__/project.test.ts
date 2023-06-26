import { describe, expect, it } from "vitest";
import { hostElements, foundFolders, folderComponents } from "../project";
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
        exportName: "default",
        name: "Cylinder",
        path: join(
          __dirname,
          "__mocks__",
          "components",
          "objects",
          "default.tsx"
        ),
      },
      {
        exportName: "Sphere",
        name: "Sphere",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
      },
      {
        exportName: "default",
        name: "Box",
        path: join(__dirname, "__mocks__", "components", "objects", "test.tsx"),
      },
    ]);
  });
});
