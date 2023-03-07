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
        column: 7,
        line: 19,
        name: "Box",
        type: "custom",
      },
      {
        children: [],
        column: 7,
        line: 25,
        name: "Cylinder",
        type: "custom",
      },
      {
        children: [],
        column: 7,
        line: 28,
        name: "SceneAlt",
        type: "custom",
      },
      {
        children: [],
        column: 7,
        line: 29,
        name: "SceneWrapped",
        type: "custom",
      },
      {
        children: [],
        column: 7,
        line: 30,
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
        column: 10,
        line: 7,
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
        column: 33,
        line: 4,
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
        column: 5,
        line: 11,
        name: "mesh",
        type: "host",
        children: [
          {
            column: 7,
            line: 12,
            name: "boxGeometry",
            type: "host",
            children: [],
          },
          {
            column: 7,
            line: 13,
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
    const sceneObject = getJsxElementAt(sourceFile, 12, 7);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      {
        column: 20,
        line: 12,
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
    const sceneObject = getJsxElementAt(sourceFile, 13, 7);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 29, line: 13, name: "color", value: "pink", type: "string" },
    ]);
  });

  it("should extract implicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 4, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 11, line: 4, name: "visible", value: true, type: "boolean" },
    ]);
  });

  it("should extract explicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 14, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      { column: 11, line: 14, name: "visible", value: true, type: "boolean" },
      {
        column: 26,
        line: 14,
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
    const sceneObject = getJsxElementAt(sourceFile, 11, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toEqual([
      {
        column: 11,
        line: 11,
        name: "position",
        value: "position",
        type: "identifier",
      },
      {
        column: 31,
        line: 11,
        name: "rotation",
        value: "rotation",
        type: "identifier",
      },
      {
        column: 51,
        line: 11,
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
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const elements = getJsxElementProps(sourceFile, sceneObject);

    expect(elements).toEqual([
      {
        column: 9,
        line: 20,
        name: "position",
        value: [
          { value: 0.9223319881614562, type: "number" },
          { value: 0, type: "number" },
          { value: 4.703084245305494, type: "number" },
        ],
        type: "array",
      },
      {
        column: 9,
        line: 21,
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
        column: 5,
        line: 3,
        name: "group",
        type: "host",
        children: [
          {
            children: [
              {
                children: [],
                column: 9,
                line: 5,
                name: "boxGeometry",
                type: "host",
              },
              {
                column: 9,
                line: 6,
                name: "meshBasicMaterial",
                type: "host",
                children: [],
              },
            ],
            column: 7,
            line: 4,
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
              "column": 7,
              "line": 4,
              "name": "cylinderGeometry",
              "type": "host",
            },
            {
              "children": [],
              "column": 7,
              "line": 5,
              "name": "meshStandardMaterial",
              "type": "host",
            },
          ],
          "column": 5,
          "line": 3,
          "name": "mesh",
          "type": "host",
        },
      ]
    `);
  });
});
