/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "path";
import { describe, expect, it } from "vitest";
import { getJsxElementAt } from "../jsx";
import { _createProject } from "../project";
import { getJsxElementPropTypes } from "../type-infer";

describe("type infer", () => {
  it("should return types of a imported component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 18, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 9,
          "description": undefined,
          "kind": "tuple",
          "line": 19,
          "name": "position",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
          ],
          "tags": {},
          "value": [
            0.9223319881614562,
            0,
            4.703084245305494,
          ],
          "valueKind": "array",
        },
        {
          "column": 9,
          "description": undefined,
          "kind": "tuple",
          "line": 20,
          "name": "rotation",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
            {
              "kind": "number",
              "label": undefined,
              "required": true,
            },
          ],
          "tags": {},
          "value": [
            1.660031347769923,
            -0.07873115868670048,
            -0.7211124466452248,
          ],
          "valueKind": "array",
        },
        {
          "description": undefined,
          "kind": "union",
          "name": "scale",
          "required": false,
          "shape": [
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "x",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "y",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "z",
                  "required": true,
                },
              ],
            },
          ],
          "tags": {},
        },
      ]
    `);
  });

  it("should return types of a local component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/import-named.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 26, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(types).toMatchInlineSnapshot(`
      {
        "props": [
          {
            "description": undefined,
            "kind": "string",
            "name": "color",
            "required": false,
            "tags": {},
          },
        ],
        "transforms": {
          "rotate": false,
          "scale": false,
          "translate": false,
        },
      }
    `);
  });

  it("should not throw when extracting types from typedef jsx", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const types = getJsxElementPropTypes(sceneObject);

    expect(Object.keys(types).length).toBeTruthy();
  });

  it("should get the jsx tag of a jsx element with children", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/variables.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 44, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 35,
          "description": undefined,
          "kind": "boolean",
          "line": 44,
          "name": "value",
          "required": true,
          "tags": {},
          "value": "null",
          "valueKind": "unhandled",
        },
        {
          "description": undefined,
          "kind": "unhandled",
          "name": "children",
          "required": false,
          "tags": {},
        },
      ]
    `);
  });

  it("should not blow up extracting same file types", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 34, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const propTypes = getJsxElementPropTypes(sceneObject);

    expect(propTypes).toMatchInlineSnapshot(`
      {
        "props": [],
        "transforms": {
          "rotate": false,
          "scale": false,
          "translate": false,
        },
      }
    `);
  });

  it("should extract args", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "args")).toMatchInlineSnapshot(`
      {
        "description": undefined,
        "kind": "tuple",
        "name": "args",
        "required": false,
        "shape": [
          {
            "kind": "number",
            "label": "width",
            "required": false,
          },
          {
            "kind": "number",
            "label": "height",
            "required": false,
          },
          {
            "kind": "number",
            "label": "depth",
            "required": false,
          },
        ],
        "tags": {},
      }
    `);
  });

  it("should infer host component types", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const propTypes = getJsxElementPropTypes(sceneObject);

    expect(Object.keys(propTypes).length).toBeGreaterThan(0);
  });

  it("should remove duplicate values from union", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "scale")).toMatchInlineSnapshot(`
      {
        "description": undefined,
        "kind": "union",
        "name": "scale",
        "required": false,
        "shape": [
          {
            "kind": "number",
          },
          {
            "kind": "tuple",
            "shape": [
              {
                "kind": "number",
                "label": "x",
                "required": true,
              },
              {
                "kind": "number",
                "label": "y",
                "required": true,
              },
              {
                "kind": "number",
                "label": "z",
                "required": true,
              },
            ],
          },
        ],
        "tags": {},
      }
    `);
  });

  it("should collect meta from jsdoc", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/meta.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 41, 10);

    const { props } = getJsxElementPropTypes(sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 21,
          "description": undefined,
          "kind": "number",
          "line": 41,
          "name": "posX",
          "required": true,
          "tags": {
            "another": true,
            "max": 10,
            "min": -10,
            "test": "yes",
          },
          "value": 5,
          "valueKind": "number",
        },
      ]
    `);
  });

  it("should sort union types to match the defined tuple value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 8, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "position");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "tuple",
          "shape": [
            {
              "kind": "number",
              "label": "x",
              "required": true,
            },
            {
              "kind": "number",
              "label": "y",
              "required": true,
            },
            {
              "kind": "number",
              "label": "z",
              "required": true,
            },
          ],
        }
      `);
  });

  it("should sort union types to match the defined number value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 12, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "position");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "number",
        }
      `);
  });

  it("should sort union types to match the defined string value", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/union-type-sorting.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 10);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementPropTypes(sceneObject);
    const prop = props.find((type) => type.name === "value");

    expect(prop && prop.kind === "union" && prop.shape[0])
      .toMatchInlineSnapshot(`
        {
          "kind": "string",
        }
      `);
  });

  it("should show union fourth arg from rotation", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 30, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }
    const { props } = getJsxElementPropTypes(sceneObject);

    expect(props.find((type) => type.name === "rotation"))
      .toMatchInlineSnapshot(`
        {
          "description": undefined,
          "kind": "tuple",
          "name": "rotation",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "x",
              "required": true,
            },
            {
              "kind": "number",
              "label": "y",
              "required": true,
            },
            {
              "kind": "number",
              "label": "z",
              "required": true,
            },
            {
              "kind": "union",
              "label": "order",
              "required": false,
              "shape": [
                {
                  "kind": "string",
                  "literal": "XYZ",
                },
                {
                  "kind": "string",
                  "literal": "YXZ",
                },
                {
                  "kind": "string",
                  "literal": "ZXY",
                },
                {
                  "kind": "string",
                  "literal": "ZYX",
                },
                {
                  "kind": "string",
                  "literal": "YZX",
                },
                {
                  "kind": "string",
                  "literal": "XZY",
                },
              ],
            },
          ],
          "tags": {},
        }
      `);
  });
});
