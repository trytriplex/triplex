import { join } from "path";
import { Project } from "ts-morph";
import { describe, it, expect } from "vitest";
import { getJsxElementsPositions } from "../jsx";

describe("jsx ast extractor", () => {
  it("should return top level components", async () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/simple/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/simple/scene.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile);

    expect(
      elements.map((x) => ({ ...x, path: x.path.replace(process.cwd(), "") }))
    ).toEqual([
      {
        children: [],
        column: 6,
        line: 6,
        name: "Box",
        path: "/packages/ts-morph/src/__tests__/__mocks__/simple/box.tsx",
      },
      {
        children: [],
        column: 6,
        line: 12,
        name: "Cylinder",
        path: "/packages/ts-morph/src/__tests__/__mocks__/simple/cylinder.tsx",
      },
    ]);
  });

  it("should return jsx information nested", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/simple/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/simple/box.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile);

    expect(elements).toEqual([
      {
        column: 10,
        line: 9,
        name: "mesh",
        path: "",
        children: [
          {
            column: 6,
            line: 11,
            name: "boxGeometry",
            path: "",
            children: [],
          },
          {
            column: 6,
            line: 12,
            name: "meshStandardMaterial",
            path: "",
            children: [],
          },
        ],
      },
    ]);
  });
});
