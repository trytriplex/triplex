import { describe, expect, it } from "vitest";
import { hostElements, foundFolders, folderComponents } from "../project";

describe("project", () => {
  it("should return a list of host jsx elements", () => {
    const actual = hostElements();

    expect(actual.length).toEqual(46);
  });

  it("should pick up all folders that contain files including parent", async () => {
    const actual = await foundFolders([
      __dirname + "/__mocks__/components/**/*.tsx",
    ]);

    expect(actual).toEqual([
      {
        path: __dirname + "/__mocks__/components",
        name: "components",
      },
      {
        path: __dirname + "/__mocks__/components/objects",
        name: "objects",
      },
      {
        path: __dirname + "/__mocks__/components/materials",
        name: "materials",
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
        path: __dirname + "/__mocks__/components/objects/default.tsx",
      },
      {
        exportName: "Sphere",
        name: "Sphere",
        path: __dirname + "/__mocks__/components/objects/test.tsx",
      },
      {
        exportName: "default",
        name: "Box",
        path: __dirname + "/__mocks__/components/objects/test.tsx",
      },
    ]);
  });
});
