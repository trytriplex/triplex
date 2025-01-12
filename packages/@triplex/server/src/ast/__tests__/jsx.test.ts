/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "upath";
import { describe, expect, it } from "vitest";
import { type JsxElementPositions } from "../../types";
import { fromCwd } from "../../util/path";
import {
  getJsxElementAt,
  getJsxElementAtOrThrow,
  getJsxElementParentExportNameOrThrow,
  getJsxElementProps,
  getJsxElementsPositions,
  getJsxTag,
} from "../jsx";
import { _createProject } from "../project";

function simplifyJsxPositions(
  elements: JsxElementPositions[],
): { name: string }[] {
  return elements.map((element) => {
    return {
      children: simplifyJsxPositions(element.children),
      name: element.name,
    };
  });
}

describe("jsx ast extractor", () => {
  it("should get owner func decl default export name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 18, 7);

    const exportName = getJsxElementParentExportNameOrThrow(sceneObject);

    expect(exportName).toEqual("default");
  });

  it("should get owner func direct decl named export name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 25, 10);

    const exportName = getJsxElementParentExportNameOrThrow(sceneObject);

    expect(exportName).toEqual("UseBox");
  });

  it("should get owner dangling arrow func default export name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/shadowed-interface.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 14, 3);

    const exportName = getJsxElementParentExportNameOrThrow(sceneObject);

    expect(exportName).toEqual("default");
  });

  it("should get owner direct arrow func named export name", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 19, 10);

    const exportName = getJsxElementParentExportNameOrThrow(sceneObject);

    expect(exportName).toEqual("SceneWrapped");
  });

  it.todo("should get owner dangling func decl named export name");

  it.todo("should get owner dangling arrow func named export name");

  it.todo(
    "should get jsx element positions from dangling func decl named export name",
  );

  it.todo(
    "should get jsx element positions from dangling arrow func named export name",
  );

  it("should infer paths for rapier", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/n_modules.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");
    elements[0].children = [];

    expect(elements[0]).toEqual({
      children: [],
      column: 5,
      exportName: "",
      line: 19,
      name: "RigidBody",
      parentPath: fromCwd(
        "packages/@triplex/server/src/ast/__tests__/__mocks__/n_modules.tsx",
      ),
      path: "",
      type: "custom",
    });
  });

  it("should return jsx positions for a expression export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/expression.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [
          {
            children: [],
            column: 7,
            line: 14,
            name: "boxGeometry",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/expression.tsx",
            ),
            type: "host",
          },
          {
            children: [],
            column: 7,
            line: 15,
            name: "meshStandardMaterial",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/expression.tsx",
            ),
            type: "host",
          },
        ],
        column: 5,
        line: 13,
        name: "mesh",
        parentPath: fromCwd(
          "/packages/@triplex/server/src/ast/__tests__/__mocks__/expression.tsx",
        ),
        type: "host",
      },
    ]);
  });

  it("should a group custom component props that is sourced from three.js", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/line-number.tsx"),
    );
    const element = getJsxElementAtOrThrow(sourceFile, 39, 10);

    const { props } = getJsxElementProps(sourceFile, element);

    expect(props.every((prop) => prop.group === "Transform")).toBeTruthy();
  });

  it("should a group custom component props that is sourced from react", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/dom.tsx"),
    );
    const element = getJsxElementAtOrThrow(sourceFile, 14, 10);

    const { props } = getJsxElementProps(sourceFile, element);

    expect(props.find((prop) => prop.name === "aria-label"))
      .toMatchInlineSnapshot(`
        {
          "description": "Defines a string value that labels the current element.",
          "group": "Accessibility",
          "kind": "string",
          "name": "aria-label",
          "required": false,
          "tags": {
            "see": true,
          },
        }
      `);
  });

  it("should not group any props from a custom component if no data was found", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const element = getJsxElementAtOrThrow(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, element);

    expect(props.every((prop) => prop.group === "Other")).toBeTruthy();
  });

  it("should return top level components for default export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [
          {
            children: [],
            column: 7,
            exportName: "default",
            line: 25,
            name: "Box",
            parentPath: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            path: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
            ),
            type: "custom",
          },
          {
            children: [],
            column: 7,
            exportName: "default",
            line: 31,
            name: "Cylinder",
            parentPath: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            path: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/cylinder.tsx",
            ),
            type: "custom",
          },
          {
            children: [],
            column: 7,
            exportName: "SceneAlt",
            line: 34,
            name: "SceneAlt",
            parentPath: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            path: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            type: "custom",
          },
          {
            children: [],
            column: 7,
            exportName: "SceneWrapped",
            line: 35,
            name: "SceneWrapped",
            parentPath: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            path: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            type: "custom",
          },
          {
            children: [],
            column: 7,
            exportName: "SceneArrow",
            line: 36,
            name: "SceneArrow",
            parentPath: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            path: fromCwd(
              "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
            ),
            type: "custom",
          },
        ],
        column: 5,
        exportName: "",
        line: 24,
        name: "Fragment",
        parentPath: fromCwd(
          "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
        ),
        path: "",
        type: "custom",
      },
    ]);
  });

  it("should return top level components for named export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "SceneAlt");

    expect(elements[0]).toEqual({
      children: [],
      column: 10,
      exportName: "default",
      line: 13,
      name: "Box",
      parentPath: fromCwd(
        "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
      ),
      path: fromCwd(
        "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
      ),
      type: "custom",
    });
  });

  it("should return top level components for named arrow export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "SceneArrow");

    expect(elements[0]).toEqual({
      children: [],
      column: 33,
      exportName: "default",
      line: 10,
      name: "Box",
      parentPath: fromCwd(
        "packages/@triplex/server/src/ast/__tests__/__mocks__/scene.tsx",
      ),
      path: fromCwd(
        "packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
      ),
      type: "custom",
    });
  });

  it("should return jsx information nested", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [
          {
            children: [],
            column: 7,
            line: 18,
            name: "boxGeometry",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
            ),
            type: "host",
          },
          {
            children: [],
            column: 7,
            line: 19,
            name: "meshStandardMaterial",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
            ),
            type: "host",
          },
        ],
        column: 5,
        line: 17,
        name: "mesh",
        parentPath: fromCwd(
          "/packages/@triplex/server/src/ast/__tests__/__mocks__/box.tsx",
        ),
        type: "host",
      },
    ]);
  });

  it("should extract tuple props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 18, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "description": "Constructor arguments",
          "group": "Constructor",
          "kind": "tuple",
          "line": 18,
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
            {
              "kind": "number",
              "label": "widthSegments",
              "required": false,
            },
            {
              "kind": "number",
              "label": "heightSegments",
              "required": false,
            },
            {
              "kind": "number",
              "label": "depthSegments",
              "required": false,
            },
          ],
          "tags": {},
          "value": [
            1,
            1,
            1,
          ],
          "valueKind": "array",
        },
        {
          "description": undefined,
          "group": "Constructor",
          "kind": "string",
          "name": "attach",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
        },
        {
          "description": "Used to control the morph target behavior; when set to true, the morph target data is treated as relative offsets, rather than as absolute positions/normals.",
          "group": "Other",
          "kind": "boolean",
          "name": "morphTargetsRelative",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "description": "Optional name for this {@link THREE.BufferGeometry | BufferGeometry} instance.",
          "group": "Constructor",
          "kind": "string",
          "name": "name",
          "required": false,
          "tags": {
            "defaultValue": "\`''\`",
          },
        },
      ]
    `);
  });

  it("should merge types and props on extracted geometry element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props.find((prop) => prop.name === "args")).toMatchInlineSnapshot(`
      {
        "column": 25,
        "description": "Constructor arguments",
        "group": "Constructor",
        "kind": "tuple",
        "line": 10,
        "name": "args",
        "required": false,
        "shape": [
          {
            "kind": "number",
            "label": "radiusTop",
            "required": false,
          },
          {
            "kind": "number",
            "label": "radiusBottom",
            "required": false,
          },
          {
            "kind": "number",
            "label": "height",
            "required": false,
          },
          {
            "kind": "number",
            "label": "radialSegments",
            "required": false,
          },
          {
            "kind": "number",
            "label": "heightSegments",
            "required": false,
          },
          {
            "kind": "boolean",
            "label": "openEnded",
            "required": false,
          },
          {
            "kind": "number",
            "label": "thetaStart",
            "required": false,
          },
          {
            "kind": "number",
            "label": "thetaLength",
            "required": false,
          },
        ],
        "tags": {},
        "value": [
          undefined,
          1,
          2,
          10,
          1,
        ],
        "valueKind": "array",
      }
    `);
  });

  it("should exclude threejs props on custom components", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAtOrThrow(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject);

    expect(props.find((prop) => prop.name === "matrix")).toBeUndefined();
  });

  it("should extract string props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": "Enables alpha hashed transparency, an alternative to {@link .transparent} or {@link .alphaTest}. The material
      will not be rendered if opacity is lower than a random threshold. Randomization introduces some grain or noise,
      but approximates alpha blending without the associated problems of sorting. Using TAARenderPass can reduce the
      resulting noise.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "alphaHash",
          "required": true,
          "tags": {},
        },
        {
          "description": "Gets the alpha value to be used when running an alpha test. Default is 0.
      Sets the alpha value to be used when running an alpha test. Default is 0.",
          "group": "Appearance",
          "kind": "number",
          "name": "alphaTest",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Enables alpha to coverage. Can only be used with MSAA-enabled rendering contexts (meaning when the renderer was
      created with *antialias* parameter set to \`true\`). Enabling this will smooth aliasing on clip plane edges and
      alphaTest-clipped edges.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "alphaToCoverage",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "aoMapIntensity",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Constructor arguments",
          "group": "Constructor",
          "kind": "tuple",
          "name": "args",
          "required": false,
          "shape": [
            {
              "kind": "unhandled",
              "label": undefined,
              "required": true,
            },
          ],
          "tags": {},
        },
        {
          "description": undefined,
          "group": "Constructor",
          "kind": "string",
          "name": "attach",
          "required": false,
          "tags": {},
        },
        {
          "description": "Represents the alpha value of the constant blend color. This property has only an effect when using custom
      blending with {@link ConstantAlphaFactor} or {@link OneMinusConstantAlphaFactor}.",
          "group": "Blend",
          "kind": "number",
          "name": "blendAlpha",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Represent the RGB values of the constant blend color. This property has only an effect when using custom
      blending with {@link ConstantColorFactor} or {@link OneMinusConstantColorFactor}.",
          "group": "Blend",
          "kind": "union",
          "name": "blendColor",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "r",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "g",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "b",
                  "required": true,
                },
              ],
            },
          ],
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Blending destination. It's one of the blending mode constants defined in Three.js. Default is {@link OneMinusSrcAlphaFactor}.",
          "group": "Blend",
          "kind": "union",
          "name": "blendDst",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "ZeroFactor",
              "literal": 200,
            },
            {
              "kind": "number",
              "label": "OneFactor",
              "literal": 201,
            },
            {
              "kind": "number",
              "label": "SrcColorFactor",
              "literal": 202,
            },
            {
              "kind": "number",
              "label": "OneMinusSrcColorFactor",
              "literal": 203,
            },
            {
              "kind": "number",
              "label": "SrcAlphaFactor",
              "literal": 204,
            },
            {
              "kind": "number",
              "label": "OneMinusSrcAlphaFactor",
              "literal": 205,
            },
            {
              "kind": "number",
              "label": "DstAlphaFactor",
              "literal": 206,
            },
            {
              "kind": "number",
              "label": "OneMinusDstAlphaFactor",
              "literal": 207,
            },
            {
              "kind": "number",
              "label": "DstColorFactor",
              "literal": 208,
            },
            {
              "kind": "number",
              "label": "OneMinusDstColorFactor",
              "literal": 209,
            },
            {
              "kind": "number",
              "label": "ConstantColorFactor",
              "literal": 211,
            },
            {
              "kind": "number",
              "label": "OneMinusConstantColorFactor",
              "literal": 212,
            },
            {
              "kind": "number",
              "label": "ConstantAlphaFactor",
              "literal": 213,
            },
            {
              "kind": "number",
              "label": "OneMinusConstantAlphaFactor",
              "literal": 214,
            },
          ],
          "tags": {
            "default": "THREE.OneMinusSrcAlphaFactor",
          },
        },
        {
          "description": "The tranparency of the .blendDst. Default is null.",
          "group": "Blend",
          "kind": "number",
          "name": "blendDstAlpha",
          "required": false,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "Blending equation to use when applying blending. It's one of the constants defined in Three.js. Default is {@link AddEquation}.",
          "group": "Blend",
          "kind": "union",
          "name": "blendEquation",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "AddEquation",
              "literal": 100,
            },
            {
              "kind": "number",
              "label": "SubtractEquation",
              "literal": 101,
            },
            {
              "kind": "number",
              "label": "ReverseSubtractEquation",
              "literal": 102,
            },
            {
              "kind": "number",
              "label": "MinEquation",
              "literal": 103,
            },
            {
              "kind": "number",
              "label": "MaxEquation",
              "literal": 104,
            },
          ],
          "tags": {
            "default": "THREE.AddEquation",
          },
        },
        {
          "description": "The tranparency of the .blendEquation. Default is null.",
          "group": "Blend",
          "kind": "number",
          "name": "blendEquationAlpha",
          "required": false,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "Which blending to use when displaying objects with this material. Default is {@link NormalBlending}.",
          "group": "Blend",
          "kind": "union",
          "name": "blending",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "NoBlending",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "NormalBlending",
              "literal": 1,
            },
            {
              "kind": "number",
              "label": "SubtractiveBlending",
              "literal": 3,
            },
            {
              "kind": "number",
              "label": "AdditiveBlending",
              "literal": 2,
            },
            {
              "kind": "number",
              "label": "MultiplyBlending",
              "literal": 4,
            },
            {
              "kind": "number",
              "label": "CustomBlending",
              "literal": 5,
            },
          ],
          "tags": {
            "default": "THREE.NormalBlending",
          },
        },
        {
          "description": "Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.",
          "group": "Blend",
          "kind": "union",
          "name": "blendSrc",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "ZeroFactor",
              "literal": 200,
            },
            {
              "kind": "number",
              "label": "OneFactor",
              "literal": 201,
            },
            {
              "kind": "number",
              "label": "SrcColorFactor",
              "literal": 202,
            },
            {
              "kind": "number",
              "label": "OneMinusSrcColorFactor",
              "literal": 203,
            },
            {
              "kind": "number",
              "label": "SrcAlphaFactor",
              "literal": 204,
            },
            {
              "kind": "number",
              "label": "OneMinusSrcAlphaFactor",
              "literal": 205,
            },
            {
              "kind": "number",
              "label": "DstAlphaFactor",
              "literal": 206,
            },
            {
              "kind": "number",
              "label": "OneMinusDstAlphaFactor",
              "literal": 207,
            },
            {
              "kind": "number",
              "label": "DstColorFactor",
              "literal": 208,
            },
            {
              "kind": "number",
              "label": "OneMinusDstColorFactor",
              "literal": 209,
            },
            {
              "kind": "number",
              "label": "ConstantColorFactor",
              "literal": 211,
            },
            {
              "kind": "number",
              "label": "OneMinusConstantColorFactor",
              "literal": 212,
            },
            {
              "kind": "number",
              "label": "ConstantAlphaFactor",
              "literal": 213,
            },
            {
              "kind": "number",
              "label": "OneMinusConstantAlphaFactor",
              "literal": 214,
            },
            {
              "kind": "number",
              "literal": 210,
            },
          ],
          "tags": {
            "default": "THREE.SrcAlphaFactor",
          },
        },
        {
          "description": "The tranparency of the .blendSrc. Default is null.",
          "group": "Blend",
          "kind": "number",
          "name": "blendSrcAlpha",
          "required": false,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "bumpScale",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
        },
        {
          "description": "Changes the behavior of clipping planes so that only their intersection is clipped, rather than their union. Default is false.",
          "group": "Render",
          "kind": "boolean",
          "name": "clipIntersection",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Defines whether to clip shadows according to the clipping planes specified on this material. Default is false.",
          "group": "Render",
          "kind": "boolean",
          "name": "clipShadows",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "column": 29,
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "line": 19,
          "name": "color",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "r",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "g",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "b",
                  "required": true,
                },
              ],
            },
          ],
          "tags": {
            "default": "new THREE.Color( 0xffffff )",
          },
          "value": "pink",
          "valueKind": "string",
        },
        {
          "description": "Whether to render the material's color. This can be used in conjunction with a mesh's .renderOrder property to create invisible objects that occlude other objects. Default is true.",
          "group": "Render",
          "kind": "boolean",
          "name": "colorWrite",
          "required": false,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Which depth function to use. Default is {@link LessEqualDepth}. See the depth mode constants for all possible values.",
          "group": "Render",
          "kind": "union",
          "name": "depthFunc",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "NeverDepth",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "AlwaysDepth",
              "literal": 1,
            },
            {
              "kind": "number",
              "label": "LessEqualDepth",
              "literal": 3,
            },
            {
              "kind": "number",
              "label": "LessDepth",
              "literal": 2,
            },
            {
              "kind": "number",
              "label": "EqualDepth",
              "literal": 4,
            },
            {
              "kind": "number",
              "label": "GreaterEqualDepth",
              "literal": 5,
            },
            {
              "kind": "number",
              "label": "GreaterDepth",
              "literal": 6,
            },
            {
              "kind": "number",
              "label": "NotEqualDepth",
              "literal": 7,
            },
          ],
          "tags": {
            "default": "THREE.LessEqualDepth",
          },
        },
        {
          "description": "Whether to have depth test enabled when rendering this material. When the depth test is disabled, the depth write
      will also be implicitly disabled.",
          "group": "Render",
          "kind": "boolean",
          "name": "depthTest",
          "required": false,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Whether rendering this material has any effect on the depth buffer. Default is true.
      When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.",
          "group": "Render",
          "kind": "boolean",
          "name": "depthWrite",
          "required": false,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "displacementBias",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "displacementScale",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Whether to apply dithering to the color to remove the appearance of banding. Default is false.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "dithering",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "name": "emissive",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "tuple",
              "shape": [
                {
                  "kind": "number",
                  "label": "r",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "g",
                  "required": true,
                },
                {
                  "kind": "number",
                  "label": "b",
                  "required": true,
                },
              ],
            },
          ],
          "tags": {
            "default": "new THREE.Color( 0x000000 )",
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "number",
          "name": "emissiveIntensity",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "envMapIntensity",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Define whether the material is rendered with flat shading. Default is false.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "flatShading",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Whether the material is affected by fog. Default is true.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "fog",
          "required": false,
          "tags": {
            "default": "fog",
          },
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "boolean",
          "name": "forceSinglePass",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "number",
          "name": "lightMapIntensity",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "number",
          "name": "metalness",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Material name. Default is an empty string.",
          "group": "Constructor",
          "kind": "string",
          "name": "name",
          "required": false,
          "tags": {
            "default": "''",
          },
        },
        {
          "description": undefined,
          "group": "Texture",
          "kind": "union",
          "name": "normalMapType",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "TangentSpaceNormalMap",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "ObjectSpaceNormalMap",
              "literal": 1,
            },
          ],
          "tags": {
            "default": "THREE.TangentSpaceNormalMap",
          },
        },
        {
          "description": "Opacity. Default is 1.",
          "group": "Appearance",
          "kind": "number",
          "name": "opacity",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Whether to use polygon offset. Default is false. This corresponds to the POLYGON_OFFSET_FILL WebGL feature.",
          "group": "Other",
          "kind": "boolean",
          "name": "polygonOffset",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Sets the polygon offset factor. Default is 0.",
          "group": "Other",
          "kind": "number",
          "name": "polygonOffsetFactor",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Sets the polygon offset units. Default is 0.",
          "group": "Other",
          "kind": "number",
          "name": "polygonOffsetUnits",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Override the renderer's default precision for this material. Can be "highp", "mediump" or "lowp". Defaults is null.",
          "group": "Other",
          "kind": "union",
          "name": "precision",
          "required": false,
          "shape": [
            {
              "kind": "string",
              "literal": "highp",
            },
            {
              "kind": "string",
              "literal": "mediump",
            },
            {
              "kind": "string",
              "literal": "lowp",
            },
          ],
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "Whether to premultiply the alpha (transparency) value. See WebGL / Materials / Transparency for an example of the difference. Default is false.",
          "group": "Other",
          "kind": "boolean",
          "name": "premultipliedAlpha",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "number",
          "name": "roughness",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Defines which of the face sides will cast shadows. Default is *null*.
      If *null*, the value is opposite that of side, above.",
          "group": "Render",
          "kind": "union",
          "name": "shadowSide",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "FrontSide",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "BackSide",
              "literal": 1,
            },
            {
              "kind": "number",
              "label": "DoubleSide",
              "literal": 2,
            },
          ],
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "Defines which of the face sides will be rendered - front, back or both.
      Default is {@link THREE.FrontSide}. Other options are {@link THREE.BackSide} and {@link THREE.DoubleSide}.",
          "group": "Render",
          "kind": "union",
          "name": "side",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "FrontSide",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "BackSide",
              "literal": 1,
            },
            {
              "kind": "number",
              "label": "DoubleSide",
              "literal": 2,
            },
          ],
          "tags": {
            "default": "{@link THREE.FrontSide}",
          },
        },
        {
          "description": "Which stencil operation to perform when the comparison function returns false. Default is {@link KeepStencilOp}. See the stencil operation constants for all possible values.",
          "group": "Stencil",
          "kind": "union",
          "name": "stencilFail",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "ZeroStencilOp",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "KeepStencilOp",
              "literal": 7680,
            },
            {
              "kind": "number",
              "label": "ReplaceStencilOp",
              "literal": 7681,
            },
            {
              "kind": "number",
              "label": "IncrementStencilOp",
              "literal": 7682,
            },
            {
              "kind": "number",
              "label": "DecrementStencilOp",
              "literal": 7283,
            },
            {
              "kind": "number",
              "label": "IncrementWrapStencilOp",
              "literal": 34055,
            },
            {
              "kind": "number",
              "label": "DecrementWrapStencilOp",
              "literal": 34056,
            },
            {
              "kind": "number",
              "label": "InvertStencilOp",
              "literal": 5386,
            },
          ],
          "tags": {
            "default": "THREE.KeepStencilOp",
          },
        },
        {
          "description": "The stencil comparison function to use. Default is {@link AlwaysStencilFunc}. See stencil operation constants for all possible values.",
          "group": "Stencil",
          "kind": "union",
          "name": "stencilFunc",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "NeverStencilFunc",
              "literal": 512,
            },
            {
              "kind": "number",
              "label": "LessStencilFunc",
              "literal": 513,
            },
            {
              "kind": "number",
              "label": "EqualStencilFunc",
              "literal": 514,
            },
            {
              "kind": "number",
              "label": "LessEqualStencilFunc",
              "literal": 515,
            },
            {
              "kind": "number",
              "label": "GreaterStencilFunc",
              "literal": 516,
            },
            {
              "kind": "number",
              "label": "NotEqualStencilFunc",
              "literal": 517,
            },
            {
              "kind": "number",
              "label": "GreaterEqualStencilFunc",
              "literal": 518,
            },
            {
              "kind": "number",
              "label": "AlwaysStencilFunc",
              "literal": 519,
            },
          ],
          "tags": {
            "default": "THREE.AlwaysStencilFunc",
          },
        },
        {
          "description": "The bit mask to use when comparing against the stencil buffer. Default is *0xFF*.",
          "group": "Stencil",
          "kind": "number",
          "name": "stencilFuncMask",
          "required": false,
          "tags": {
            "default": 255,
          },
        },
        {
          "description": "The value to use when performing stencil comparisons or stencil operations. Default is *0*.",
          "group": "Stencil",
          "kind": "number",
          "name": "stencilRef",
          "required": false,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Whether rendering this material has any effect on the stencil buffer. Default is *false*.",
          "group": "Stencil",
          "kind": "boolean",
          "name": "stencilWrite",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "The bit mask to use when writing to the stencil buffer. Default is *0xFF*.",
          "group": "Stencil",
          "kind": "number",
          "name": "stencilWriteMask",
          "required": false,
          "tags": {
            "default": 255,
          },
        },
        {
          "description": "Which stencil operation to perform when the comparison function returns true but the depth test fails.
      Default is {@link KeepStencilOp}.
      See the stencil operation constants for all possible values.",
          "group": "Stencil",
          "kind": "union",
          "name": "stencilZFail",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "ZeroStencilOp",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "KeepStencilOp",
              "literal": 7680,
            },
            {
              "kind": "number",
              "label": "ReplaceStencilOp",
              "literal": 7681,
            },
            {
              "kind": "number",
              "label": "IncrementStencilOp",
              "literal": 7682,
            },
            {
              "kind": "number",
              "label": "DecrementStencilOp",
              "literal": 7283,
            },
            {
              "kind": "number",
              "label": "IncrementWrapStencilOp",
              "literal": 34055,
            },
            {
              "kind": "number",
              "label": "DecrementWrapStencilOp",
              "literal": 34056,
            },
            {
              "kind": "number",
              "label": "InvertStencilOp",
              "literal": 5386,
            },
          ],
          "tags": {
            "default": "THREE.KeepStencilOp",
          },
        },
        {
          "description": "Which stencil operation to perform when the comparison function returns true and the depth test passes.
      Default is {@link KeepStencilOp}.
      See the stencil operation constants for all possible values.",
          "group": "Stencil",
          "kind": "union",
          "name": "stencilZPass",
          "required": false,
          "shape": [
            {
              "kind": "number",
              "label": "ZeroStencilOp",
              "literal": 0,
            },
            {
              "kind": "number",
              "label": "KeepStencilOp",
              "literal": 7680,
            },
            {
              "kind": "number",
              "label": "ReplaceStencilOp",
              "literal": 7681,
            },
            {
              "kind": "number",
              "label": "IncrementStencilOp",
              "literal": 7682,
            },
            {
              "kind": "number",
              "label": "DecrementStencilOp",
              "literal": 7283,
            },
            {
              "kind": "number",
              "label": "IncrementWrapStencilOp",
              "literal": 34055,
            },
            {
              "kind": "number",
              "label": "DecrementWrapStencilOp",
              "literal": 34056,
            },
            {
              "kind": "number",
              "label": "InvertStencilOp",
              "literal": 5386,
            },
          ],
          "tags": {
            "default": "THREE.KeepStencilOp",
          },
        },
        {
          "description": "Defines whether this material is tone mapped according to the renderer's
      {@link WebGLRenderer.toneMapping toneMapping} setting. It is ignored when rendering to a render target or using
      post processing.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "toneMapped",
          "required": false,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Defines whether this material is transparent. This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
      When set to true, the extent to which the material is transparent is controlled by setting it's .opacity property.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "transparent",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Defines whether vertex coloring is used. Default is false.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "vertexColors",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Defines whether this material is visible. Default is true.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "visible",
          "required": false,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "boolean",
          "name": "wireframe",
          "required": false,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "wireframeLinecap",
          "required": false,
          "tags": {
            "default": "'round'",
          },
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "string",
          "name": "wireframeLinejoin",
          "required": false,
          "tags": {
            "default": "'round'",
          },
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "number",
          "name": "wireframeLinewidth",
          "required": false,
          "tags": {
            "default": 1,
          },
        },
      ]
    `);
  });

  it("should extract a declared tuple inside a union prop and mark them as required", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[1]).toMatchInlineSnapshot(`
      {
        "description": undefined,
        "group": "Other",
        "kind": "tuple",
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
      }
    `);
  });

  it("should extract a declared tuple prop and mark them as required", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props.find((prop) => prop.name === "position"))
      .toMatchInlineSnapshot(`
        {
          "column": 15,
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "line": 25,
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
            0,
            0,
            0,
          ],
          "valueKind": "array",
        }
      `);
  });

  it("should extract implicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": "Constructor arguments",
          "group": "Constructor",
          "kind": "tuple",
          "name": "args",
          "required": false,
          "shape": [
            {
              "kind": "unhandled",
              "label": "geometry",
              "required": false,
            },
            {
              "kind": "unhandled",
              "label": "material",
              "required": false,
            },
          ],
          "tags": {},
        },
        {
          "description": undefined,
          "group": "Constructor",
          "kind": "string",
          "name": "attach",
          "required": false,
          "tags": {},
        },
        {
          "description": "Whether the object gets rendered into shadow map.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "castShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "column": 7,
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "line": 11,
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
          "value": "<boxGeometry />",
          "valueKind": "unhandled",
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to \`false\` the object gets rendered every frame even if it is not in the frustum of the camera.",
          "group": "Render",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
        },
        {
          "description": undefined,
          "group": "Render",
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": "Optional name of the object",
          "group": "Constructor",
          "kind": "string",
          "name": "name",
          "required": false,
          "tags": {
            "defaultValue": "\`""\`",
            "remarks": "_(doesn't need to be unique)_.",
          },
        },
        {
          "description": undefined,
          "group": "Transform",
          "kind": "union",
          "name": "position",
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
        {
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "name": "quaternion",
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
              "kind": "number",
              "label": "w",
              "required": true,
            },
          ],
          "tags": {},
        },
        {
          "description": "Whether the material receives shadows.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "description": "This value allows the default rendering order of {@link https://en.wikipedia.org/wiki/Scene_graph | scene graph}
      objects to be overridden although opaque and transparent objects remain sorted independently.",
          "group": "Render",
          "kind": "number",
          "name": "renderOrder",
          "required": false,
          "tags": {
            "defaultValue": "\`0\`",
            "remarks": "When this property is set for an instance of {@link Group | Group}, all descendants objects will be sorted and rendered together.
      Sorting is from lowest to highest renderOrder.",
          },
        },
        {
          "description": undefined,
          "group": "Transform",
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
        },
        {
          "description": undefined,
          "group": "Transform",
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
        {
          "column": 11,
          "description": "Object gets rendered if \`true\`.",
          "group": "Appearance",
          "kind": "boolean",
          "line": 10,
          "name": "visible",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
          "value": true,
          "valueKind": "boolean",
        },
      ]
    `);
  });

  it("should extract explicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": "Constructor arguments",
          "group": "Constructor",
          "kind": "tuple",
          "name": "args",
          "required": false,
          "shape": [
            {
              "kind": "unhandled",
              "label": "geometry",
              "required": false,
            },
            {
              "kind": "unhandled",
              "label": "material",
              "required": false,
            },
          ],
          "tags": {},
        },
        {
          "description": undefined,
          "group": "Constructor",
          "kind": "string",
          "name": "attach",
          "required": false,
          "tags": {},
        },
        {
          "column": 11,
          "description": "Whether the object gets rendered into shadow map.",
          "group": "Appearance",
          "kind": "boolean",
          "line": 20,
          "name": "castShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
          "value": false,
          "valueKind": "boolean",
        },
        {
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to \`false\` the object gets rendered every frame even if it is not in the frustum of the camera.",
          "group": "Render",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
        },
        {
          "description": undefined,
          "group": "Render",
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": "Optional name of the object",
          "group": "Constructor",
          "kind": "string",
          "name": "name",
          "required": false,
          "tags": {
            "defaultValue": "\`""\`",
            "remarks": "_(doesn't need to be unique)_.",
          },
        },
        {
          "description": undefined,
          "group": "Transform",
          "kind": "union",
          "name": "position",
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
        {
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "name": "quaternion",
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
              "kind": "number",
              "label": "w",
              "required": true,
            },
          ],
          "tags": {},
        },
        {
          "description": "Whether the material receives shadows.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "description": "This value allows the default rendering order of {@link https://en.wikipedia.org/wiki/Scene_graph | scene graph}
      objects to be overridden although opaque and transparent objects remain sorted independently.",
          "group": "Render",
          "kind": "number",
          "name": "renderOrder",
          "required": false,
          "tags": {
            "defaultValue": "\`0\`",
            "remarks": "When this property is set for an instance of {@link Group | Group}, all descendants objects will be sorted and rendered together.
      Sorting is from lowest to highest renderOrder.",
          },
        },
        {
          "description": undefined,
          "group": "Transform",
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
        },
        {
          "description": undefined,
          "group": "Transform",
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
        {
          "column": 30,
          "description": "Object gets rendered if \`true\`.",
          "group": "Appearance",
          "kind": "boolean",
          "line": 20,
          "name": "visible",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
          "value": true,
          "valueKind": "boolean",
        },
      ]
    `);
  });

  it("should merge props and types for rounded box", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[5]).toMatchInlineSnapshot(`
      {
        "description": undefined,
        "group": "Other",
        "kind": "number",
        "name": "creaseAngle",
        "required": false,
        "tags": {},
      }
    `);
    expect(props[3]).toMatchInlineSnapshot(`
      {
        "description": "Whether the object gets rendered into shadow map.",
        "group": "Appearance",
        "kind": "boolean",
        "name": "castShadow",
        "required": false,
        "tags": {
          "defaultValue": "\`false\`",
        },
      }
    `);
  });

  it("should extract union type from string literal", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 41, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 12,
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "line": 41,
          "name": "color",
          "required": true,
          "shape": [
            {
              "kind": "string",
              "literal": "black",
            },
            {
              "kind": "string",
              "literal": "white",
            },
          ],
          "tags": {},
          "value": "black",
          "valueKind": "string",
        },
      ]
    `);
  });

  it("should extract union type from string literal when set to undefined", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 42, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "description": undefined,
          "group": "Other",
          "kind": "union",
          "line": 42,
          "name": "color",
          "required": false,
          "shape": [
            {
              "kind": "string",
              "literal": "black",
            },
            {
              "kind": "string",
              "literal": "white",
            },
          ],
          "tags": {},
          "value": undefined,
          "valueKind": "undefined",
        },
      ]
    `);
  });

  it("should extract props with identifiers from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 17, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": "Constructor arguments",
          "group": "Constructor",
          "kind": "tuple",
          "name": "args",
          "required": false,
          "shape": [
            {
              "kind": "unhandled",
              "label": "geometry",
              "required": false,
            },
            {
              "kind": "unhandled",
              "label": "material",
              "required": false,
            },
          ],
          "tags": {},
        },
        {
          "description": undefined,
          "group": "Constructor",
          "kind": "string",
          "name": "attach",
          "required": false,
          "tags": {},
        },
        {
          "description": "Whether the object gets rendered into shadow map.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "castShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "column": 7,
          "description": undefined,
          "group": "Appearance",
          "kind": "union",
          "line": 18,
          "name": "children",
          "required": false,
          "shape": [
            {
              "kind": "string",
            },
            {
              "kind": "number",
            },
            {
              "kind": "boolean",
              "literal": false,
            },
          ],
          "tags": {},
          "value": "<boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="pink" />",
          "valueKind": "unhandled",
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to \`false\` the object gets rendered every frame even if it is not in the frustum of the camera.",
          "group": "Render",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
        },
        {
          "description": undefined,
          "group": "Render",
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": "Optional name of the object",
          "group": "Constructor",
          "kind": "string",
          "name": "name",
          "required": false,
          "tags": {
            "defaultValue": "\`""\`",
            "remarks": "_(doesn't need to be unique)_.",
          },
        },
        {
          "column": 11,
          "description": undefined,
          "group": "Transform",
          "kind": "union",
          "line": 17,
          "name": "position",
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
          "value": "position",
          "valueKind": "identifier",
        },
        {
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "name": "quaternion",
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
              "kind": "number",
              "label": "w",
              "required": true,
            },
          ],
          "tags": {},
        },
        {
          "description": "Whether the material receives shadows.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": false,
          "tags": {
            "defaultValue": "\`false\`",
          },
        },
        {
          "description": "This value allows the default rendering order of {@link https://en.wikipedia.org/wiki/Scene_graph | scene graph}
      objects to be overridden although opaque and transparent objects remain sorted independently.",
          "group": "Render",
          "kind": "number",
          "name": "renderOrder",
          "required": false,
          "tags": {
            "defaultValue": "\`0\`",
            "remarks": "When this property is set for an instance of {@link Group | Group}, all descendants objects will be sorted and rendered together.
      Sorting is from lowest to highest renderOrder.",
          },
        },
        {
          "column": 31,
          "description": undefined,
          "group": "Transform",
          "kind": "tuple",
          "line": 17,
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
          "value": "rotation",
          "valueKind": "identifier",
        },
        {
          "column": 51,
          "description": undefined,
          "group": "Transform",
          "kind": "union",
          "line": 17,
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
          "value": "scale",
          "valueKind": "identifier",
        },
        {
          "description": "Object gets rendered if \`true\`.",
          "group": "Appearance",
          "kind": "boolean",
          "name": "visible",
          "required": false,
          "tags": {
            "defaultValue": "\`true\`",
          },
        },
      ]
    `);
  });

  it("should extract array static props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const { props } = getJsxElementProps(sourceFile, sceneObject);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 9,
          "description": undefined,
          "group": "Other",
          "kind": "tuple",
          "line": 26,
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
          "group": "Other",
          "kind": "tuple",
          "line": 27,
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
          "group": "Other",
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

  it("should extract array static props from nested host jsx elements", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/nested.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [],
                column: 9,
                line: 11,
                name: "boxGeometry",
                parentPath: fromCwd(
                  "/packages/@triplex/server/src/ast/__tests__/__mocks__/nested.tsx",
                ),
                type: "host",
              },
              {
                children: [],
                column: 9,
                line: 12,
                name: "meshBasicMaterial",
                parentPath: fromCwd(
                  "/packages/@triplex/server/src/ast/__tests__/__mocks__/nested.tsx",
                ),
                type: "host",
              },
            ],
            column: 7,
            line: 10,
            name: "mesh",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/nested.tsx",
            ),
            type: "host",
          },
        ],
        column: 5,
        line: 9,
        name: "group",
        parentPath: fromCwd(
          "/packages/@triplex/server/src/ast/__tests__/__mocks__/nested.tsx",
        ),
        type: "host",
      },
    ]);
  });

  it("should extract jsx positions from a separated export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toEqual([
      {
        children: [
          {
            children: [],
            column: 7,
            line: 10,
            name: "geo-hi (cylinderGeometry)",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/cylinder.tsx",
            ),
            type: "host",
          },
          {
            children: [],
            column: 7,
            line: 11,
            name: "meshStandardMaterial",
            parentPath: fromCwd(
              "/packages/@triplex/server/src/ast/__tests__/__mocks__/cylinder.tsx",
            ),
            type: "host",
          },
        ],
        column: 5,
        line: 9,
        name: "this-is-cilly (mesh)",
        parentPath: fromCwd(
          "/packages/@triplex/server/src/ast/__tests__/__mocks__/cylinder.tsx",
        ),
        type: "host",
      },
    ]);
  });

  it("should get the tag name from a string literal for a named group", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 9, 5);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const tag = getJsxTag(sceneObject);

    expect(tag.tagName).toEqual("mesh");
    expect(tag.name).toEqual("this-is-cilly");
  });

  it("should get the tag name from a jsx expression string literal for a named group", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx"),
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const tag = getJsxTag(sceneObject);

    expect(tag.tagName).toEqual("cylinderGeometry");
    expect(tag.name).toEqual("geo-hi");
  });

  it("should correctly nest a shorthand fragment", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/nested.tsx"),
    );

    const elements = getJsxElementsPositions(sourceFile, "ShorthandFragment");

    expect(simplifyJsxPositions(elements)).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [],
                  "name": "mesh",
                },
              ],
              "name": "Fragment",
            },
          ],
          "name": "group",
        },
      ]
    `);
  });
});
