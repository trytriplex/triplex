import { join } from "path";
import { Project } from "ts-morph";
import { describe, it, expect } from "vitest";
import {
  getJsxElementAt,
  getJsxElementProps,
  getJsxElementsPositions,
} from "../jsx";

describe("jsx ast extractor", () => {
  it("should return top level components", async () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
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
        path: "/packages/ts-morph/src/__tests__/__mocks__/box.tsx",
      },
      {
        children: [],
        column: 6,
        line: 12,
        name: "Cylinder",
        path: "/packages/ts-morph/src/__tests__/__mocks__/cylinder.tsx",
      },
    ]);
  });

  it("should return jsx information nested", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
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

  it("should extract tuple props from a host jsx element", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 11, 6);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 18, line: 11, name: "args", value: [1, 1, 1], type: "static" },
    ]);
  });

  it("should extract string props from a host jsx element", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 6);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 27, line: 12, name: "color", value: "pink", type: "static" },
    ]);
  });

  it("should extract props with identifiers from a host jsx element", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 9, 10);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      {
        column: 9,
        line: 10,
        name: "position",
        value: "position",
        type: "unhandled",
      },
      {
        column: 29,
        line: 10,
        name: "rotation",
        value: "rotation",
        type: "unhandled",
      },
      {
        column: 49,
        line: 10,
        name: "scale",
        value: "scale",
        type: "unhandled",
      },
    ]);
  });

  it("should extract array static props from a host jsx element", () => {
    const project = new Project({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 6, 6);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      {
        column: 10,
        line: 6,
        name: "position",
        value: [0.9223319881614562, 0, 4.703084245305494],
        type: "static",
      },
      {
        column: 61,
        line: 7,
        name: "rotation",
        value: [1.660031347769923, -0.07873115868670048, -0.7211124466452248],
        type: "static",
      },
    ]);
  });
});
