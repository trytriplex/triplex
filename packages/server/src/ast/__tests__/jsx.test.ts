import { join } from "path";
import { describe, it, expect } from "vitest";
import {
  getJsxElementAt,
  getJsxElementProps,
  getJsxElementsPositions,
} from "../jsx";
import { _createProject } from "../project";

describe("jsx ast extractor", () => {
  it("should return top level components for default export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [],
        column: 6,
        line: 18,
        name: "Box",
        type: "custom",
      },
      {
        children: [],
        column: 6,
        line: 24,
        name: "Cylinder",
        type: "custom",
      },
      {
        children: [],
        column: 6,
        line: 27,
        name: "SceneAlt",
        type: "custom",
      },
      {
        children: [],
        column: 6,
        line: 28,
        name: "SceneWrapped",
        type: "custom",
      },
      {
        children: [],
        column: 6,
        line: 29,
        name: "SceneArrow",
        type: "custom",
      },
    ]);
  });

  it("should return top level components for named export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "SceneAlt");

    expect(elements).toEqual([
      {
        children: [],
        column: 8,
        line: 6,
        name: "Box",
        type: "custom",
      },
    ]);
  });

  it("should return top level components for named arrow export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "SceneArrow");

    expect(elements).toEqual([
      {
        children: [],
        column: 31,
        line: 3,
        name: "Box",
        type: "custom",
      },
    ]);
  });

  it("should return jsx information nested", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        column: 10,
        line: 9,
        name: "mesh",
        type: "host",
        children: [
          {
            column: 6,
            line: 11,
            name: "boxGeometry",
            type: "host",
            children: [],
          },
          {
            column: 6,
            line: 12,
            name: "meshStandardMaterial",
            type: "host",
            children: [],
          },
        ],
      },
    ]);
  });

  it("should extract tuple props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 11, 6);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      {
        column: 18,
        line: 11,
        name: "args",
        type: "array",
        value: [
          { type: "number", value: 1 },
          { type: "number", value: 1 },
          { type: "number", value: 1 },
        ],
      },
    ]);
  });

  it("should extract string props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 6);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 27, line: 12, name: "color", value: "pink", type: "string" },
    ]);
  });

  it("should extract implicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 1, 10);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 9, line: 3, name: "visible", value: true, type: "boolean" },
    ]);
  });

  it("should extract explicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 11, 10);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 9, line: 13, name: "visible", value: true, type: "boolean" },
      {
        column: 24,
        line: 13,
        name: "castShadow",
        value: false,
        type: "boolean",
      },
    ]);
  });

  it("should extract props with identifiers from a host jsx element", () => {
    const project = _createProject({
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
        type: "identifier",
      },
      {
        column: 29,
        line: 10,
        name: "rotation",
        value: "rotation",
        type: "identifier",
      },
      {
        column: 49,
        line: 10,
        name: "scale",
        value: "scale",
        type: "identifier",
      },
    ]);
  });

  it("should extract array static props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 18, 6);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const elements = getJsxElementProps(sourceFile, sceneObject);

    expect(elements).toEqual([
      {
        column: 10,
        line: 18,
        name: "position",
        value: [
          { value: 0.9223319881614562, type: "number" },
          { value: 0, type: "number" },
          { value: 4.703084245305494, type: "number" },
        ],
        type: "array",
      },
      {
        column: 61,
        line: 19,
        name: "rotation",
        value: [
          { value: 1.660031347769923, type: "number" },
          { value: -0.07873115868670048, type: "number" },
          { value: -0.7211124466452248, type: "number" },
        ],
        type: "array",
      },
    ]);
  });

  it("should extract array static props from nested host jsx elements", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/nested.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        column: 10,
        line: 1,
        name: "group",
        type: "host",
        children: [
          {
            children: [
              {
                children: [],
                column: 8,
                line: 4,
                name: "boxGeometry",
                type: "host",
              },
              {
                column: 8,
                line: 5,
                name: "meshBasicMaterial",
                type: "host",
                children: [],
              },
            ],
            column: 6,
            line: 3,
            name: "mesh",
            type: "host",
          },
        ],
      },
    ]);
  });

  it("should extract jsx positions from a separated export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [],
              "column": 6,
              "line": 3,
              "name": "cylinderGeometry",
              "type": "host",
            },
            {
              "children": [],
              "column": 6,
              "line": 4,
              "name": "meshStandardMaterial",
              "type": "host",
            },
          ],
          "column": 10,
          "line": 1,
          "name": "mesh",
          "type": "host",
        },
      ]
    `);
  });
});
