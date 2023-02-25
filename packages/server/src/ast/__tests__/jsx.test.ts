import { join } from "path";
import { describe, it, expect } from "vitest";
import {
  getJsxElementAt,
  getJsxElementProps,
  getJsxElementsPositions,
  getJsxElementPropTypes,
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
      { column: 18, line: 11, name: "args", value: [1, 1, 1], type: "static" },
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
      { column: 27, line: 12, name: "color", value: "pink", type: "static" },
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
        value: [0.9223319881614562, 0, 4.703084245305494],
        type: "static",
      },
      {
        column: 61,
        line: 19,
        name: "rotation",
        value: [1.660031347769923, -0.07873115868670048, -0.7211124466452248],
        type: "static",
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

  it("should return the path of an imported component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 11, 6);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    expect(types.filePath).toEqual(
      join(process.cwd(), "packages/server/src/ast/__tests__/__mocks__/box.tsx")
    );
  });

  it("should return the path of an local component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 6);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    expect(types.filePath).toEqual(
      join(
        process.cwd(),
        "packages/server/src/ast/__tests__/__mocks__/import-named.tsx"
      )
    );
  });

  it("should return types of a imported component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 11, 6);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    expect(types.propTypes).toMatchInlineSnapshot(`
      {
        "position": {
          "name": "position",
          "required": false,
          "type": [
            "number",
            "number",
            "number",
          ],
        },
        "rotation": {
          "name": "rotation",
          "required": false,
          "type": [
            "number",
            "number",
            "number",
          ],
        },
        "scale": {
          "name": "scale",
          "required": false,
          "type": [
            "number",
            "number",
            "number",
          ],
        },
      }
    `);
  });

  it("should return types of a local component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 6);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    expect(types.propTypes).toMatchInlineSnapshot(`
      {
        "color": {
          "name": "color",
          "required": false,
          "type": {
            "kind": "type",
            "value": "string",
          },
        },
      }
    `);
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
