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

    const { propTypes } = getJsxElementPropTypes(sceneObject);

    expect(propTypes).toMatchInlineSnapshot(`
      [
        {
          "declared": true,
          "description": undefined,
          "name": "position",
          "required": false,
          "tags": {},
          "type": {
            "type": "tuple",
            "values": [
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
            ],
          },
        },
        {
          "declared": true,
          "description": undefined,
          "name": "rotation",
          "required": false,
          "tags": {},
          "type": {
            "type": "tuple",
            "values": [
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
              {
                "label": undefined,
                "required": true,
                "type": "number",
              },
            ],
          },
        },
        {
          "declared": false,
          "description": undefined,
          "name": "scale",
          "required": false,
          "tags": {},
          "type": {
            "type": "union",
            "value": "",
            "values": [
              {
                "type": "number",
              },
              {
                "type": "tuple",
                "values": [
                  {
                    "label": "x",
                    "required": true,
                    "type": "number",
                  },
                  {
                    "label": "y",
                    "required": true,
                    "type": "number",
                  },
                  {
                    "label": "z",
                    "required": true,
                    "type": "number",
                  },
                ],
              },
            ],
          },
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
        "propTypes": [
          {
            "declared": false,
            "description": undefined,
            "name": "color",
            "required": false,
            "tags": {},
            "type": {
              "type": "string",
            },
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
    const { propTypes } = getJsxElementPropTypes(sceneObject);

    expect(propTypes).toMatchInlineSnapshot(`
      [
        {
          "declared": true,
          "description": undefined,
          "name": "value",
          "required": true,
          "tags": {},
          "type": {
            "type": "boolean",
          },
        },
        {
          "declared": false,
          "description": undefined,
          "name": "children",
          "required": false,
          "tags": {},
          "type": {
            "type": "unknown",
          },
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
        "propTypes": [],
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
    const { propTypes } = getJsxElementPropTypes(sceneObject);

    expect(propTypes.find((type) => type.name === "args"))
      .toMatchInlineSnapshot(`
        {
          "declared": false,
          "description": undefined,
          "name": "args",
          "required": false,
          "tags": {},
          "type": {
            "type": "tuple",
            "values": [
              {
                "label": "width",
                "required": false,
                "type": "number",
              },
              {
                "label": "height",
                "required": false,
                "type": "number",
              },
              {
                "label": "depth",
                "required": false,
                "type": "number",
              },
            ],
          },
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
    const { propTypes } = getJsxElementPropTypes(sceneObject);

    expect(propTypes.find((type) => type.name === "scale"))
      .toMatchInlineSnapshot(`
        {
          "declared": false,
          "description": undefined,
          "name": "scale",
          "required": false,
          "tags": {},
          "type": {
            "type": "union",
            "value": "",
            "values": [
              {
                "type": "number",
              },
              {
                "type": "tuple",
                "values": [
                  {
                    "label": "x",
                    "required": true,
                    "type": "number",
                  },
                  {
                    "label": "y",
                    "required": true,
                    "type": "number",
                  },
                  {
                    "label": "z",
                    "required": true,
                    "type": "number",
                  },
                ],
              },
            ],
          },
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

    const { propTypes } = getJsxElementPropTypes(sceneObject!);

    expect(propTypes).toMatchInlineSnapshot(`
      [
        {
          "declared": true,
          "description": undefined,
          "name": "posX",
          "required": true,
          "tags": {
            "another": true,
            "max": 10,
            "min": -10,
            "test": "yes",
          },
          "type": {
            "type": "number",
          },
        },
      ]
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
    const { propTypes } = getJsxElementPropTypes(sceneObject);

    expect(propTypes.find((type) => type.name === "rotation"))
      .toMatchInlineSnapshot(`
        {
          "declared": false,
          "description": undefined,
          "name": "rotation",
          "required": false,
          "tags": {},
          "type": {
            "type": "tuple",
            "values": [
              {
                "label": "x",
                "required": true,
                "type": "number",
              },
              {
                "label": "y",
                "required": true,
                "type": "number",
              },
              {
                "label": "z",
                "required": true,
                "type": "number",
              },
              {
                "label": "order",
                "required": false,
                "type": "union",
                "value": "",
                "values": [
                  {
                    "type": "string",
                    "value": "XYZ",
                  },
                  {
                    "type": "string",
                    "value": "YXZ",
                  },
                  {
                    "type": "string",
                    "value": "ZXY",
                  },
                  {
                    "type": "string",
                    "value": "ZYX",
                  },
                  {
                    "type": "string",
                    "value": "YZX",
                  },
                  {
                    "type": "string",
                    "value": "XZY",
                  },
                ],
              },
            ],
          },
        }
      `);
  });
});
