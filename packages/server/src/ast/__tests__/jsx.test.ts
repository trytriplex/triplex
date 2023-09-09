/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "path";
import { describe, it, expect } from "vitest";
import {
  getJsxElementAt,
  getJsxElementProps,
  getJsxElementsPositions,
  getJsxTag,
} from "../jsx";
import { _createProject } from "../project";

describe("jsx ast extractor", () => {
  it("should return jsx positions for a expression export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/expression.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [],
              "column": 7,
              "line": 14,
              "name": "boxGeometry",
              "type": "host",
            },
            {
              "children": [],
              "column": 7,
              "line": 15,
              "name": "meshStandardMaterial",
              "type": "host",
            },
          ],
          "column": 5,
          "line": 13,
          "name": "mesh",
          "type": "host",
        },
      ]
    `);
  });

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
        line: 25,
        name: "Box",
        type: "custom",
        exportName: "default",
        path: join(
          process.cwd(),
          "packages/server/src/ast/__tests__/__mocks__/box.tsx"
        ),
      },
      {
        children: [],
        column: 7,
        line: 31,
        name: "Cylinder",
        type: "custom",
        exportName: "default",
        path: join(
          process.cwd(),
          "packages/server/src/ast/__tests__/__mocks__/cylinder.tsx"
        ),
      },
      {
        children: [],
        column: 7,
        line: 34,
        name: "SceneAlt",
        exportName: "SceneAlt",
        type: "custom",
        path: join(
          process.cwd(),
          "packages/server/src/ast/__tests__/__mocks__/scene.tsx"
        ),
      },
      {
        children: [],
        column: 7,
        line: 35,
        name: "SceneWrapped",
        type: "custom",
        exportName: "SceneWrapped",
        path: join(
          process.cwd(),
          "packages/server/src/ast/__tests__/__mocks__/scene.tsx"
        ),
      },
      {
        children: [],
        column: 7,
        line: 36,
        name: "SceneArrow",
        exportName: "SceneArrow",
        type: "custom",
        path: join(
          process.cwd(),
          "packages/server/src/ast/__tests__/__mocks__/scene.tsx"
        ),
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

    expect(elements[0]).toEqual({
      children: [],
      column: 10,
      line: 13,
      name: "Box",
      type: "custom",
      exportName: "default",
      path: join(
        process.cwd(),
        "packages/server/src/ast/__tests__/__mocks__/box.tsx"
      ),
    });
  });

  it("should return top level components for named arrow export", async () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/scene.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "SceneArrow");

    expect(elements[0]).toEqual({
      children: [],
      column: 33,
      exportName: "default",
      line: 10,
      name: "Box",
      path: join(
        process.cwd(),
        "packages/server/src/ast/__tests__/__mocks__/box.tsx"
      ),
      type: "custom",
    });
  });

  it("should return jsx information nested", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [],
              "column": 7,
              "line": 18,
              "name": "boxGeometry",
              "type": "host",
            },
            {
              "children": [],
              "column": 7,
              "line": 19,
              "name": "meshStandardMaterial",
              "type": "host",
            },
          ],
          "column": 5,
          "line": 17,
          "name": "mesh",
          "type": "host",
        },
      ]
    `);
  });

  it("should extract tuple props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 18, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "description": undefined,
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
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {
            "default": "''",
          },
        },
        {
          "description": undefined,
          "kind": "boolean",
          "name": "morphTargetsRelative",
          "required": true,
          "tags": {
            "default": "false",
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
      join(__dirname, "__mocks__/cylinder.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[0]).toMatchInlineSnapshot(`
      {
        "column": 25,
        "description": undefined,
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

  it("should extract string props from a host jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
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
          "description": "Material name. Default is an empty string.",
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {
            "default": "''",
          },
        },
        {
          "description": "Defines whether this material is visible. Default is true.",
          "kind": "boolean",
          "name": "visible",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "column": 29,
          "description": undefined,
          "kind": "union",
          "line": 19,
          "name": "color",
          "required": true,
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
          "description": "Opacity. Default is 1.",
          "kind": "number",
          "name": "opacity",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Defines whether this material is transparent. This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
      When set to true, the extent to which the material is transparent is controlled by setting it's .opacity property.
      Default is false.",
          "kind": "boolean",
          "name": "transparent",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "metalness",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "roughness",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Sets the alpha value to be used when running an alpha test. Default is 0.",
          "kind": "number",
          "name": "alphaTest",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Enables alpha to coverage. Can only be used with MSAA-enabled rendering contexts.",
          "kind": "boolean",
          "name": "alphaToCoverage",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "aoMapIntensity",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "The tranparency of the .blendDst. Default is null.",
          "kind": "number",
          "name": "blendDstAlpha",
          "required": true,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "The tranparency of the .blendEquation. Default is null.",
          "kind": "number",
          "name": "blendEquationAlpha",
          "required": true,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": "Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.",
          "kind": "union",
          "name": "blendSrc",
          "required": true,
          "shape": [],
          "tags": {
            "default": "THREE.SrcAlphaFactor",
          },
        },
        {
          "description": "The tranparency of the .blendSrc. Default is null.",
          "kind": "number",
          "name": "blendSrcAlpha",
          "required": true,
          "tags": {
            "default": "null",
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "bumpScale",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Changes the behavior of clipping planes so that only their intersection is clipped, rather than their union. Default is false.",
          "kind": "boolean",
          "name": "clipIntersection",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Defines whether to clip shadows according to the clipping planes specified on this material. Default is false.",
          "kind": "boolean",
          "name": "clipShadows",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Whether to render the material's color. This can be used in conjunction with a mesh's .renderOrder property to create invisible objects that occlude other objects. Default is true.",
          "kind": "boolean",
          "name": "colorWrite",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Whether to have depth test enabled when rendering this material. Default is true.",
          "kind": "boolean",
          "name": "depthTest",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Whether rendering this material has any effect on the depth buffer. Default is true.
      When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.",
          "kind": "boolean",
          "name": "depthWrite",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "displacementBias",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "displacementScale",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Whether to apply dithering to the color to remove the appearance of banding. Default is false.",
          "kind": "boolean",
          "name": "dithering",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "kind": "union",
          "name": "emissive",
          "required": true,
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
          "kind": "number",
          "name": "emissiveIntensity",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "envMapIntensity",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Define whether the material is rendered with flat shading. Default is false.",
          "kind": "boolean",
          "name": "flatShading",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Whether the material is affected by fog. Default is true.",
          "kind": "boolean",
          "name": "fog",
          "required": true,
          "tags": {
            "default": "fog",
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "lightMapIntensity",
          "required": true,
          "tags": {
            "default": 1,
          },
        },
        {
          "description": "Whether to use polygon offset. Default is false. This corresponds to the POLYGON_OFFSET_FILL WebGL feature.",
          "kind": "boolean",
          "name": "polygonOffset",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Sets the polygon offset factor. Default is 0.",
          "kind": "number",
          "name": "polygonOffsetFactor",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Sets the polygon offset units. Default is 0.",
          "kind": "number",
          "name": "polygonOffsetUnits",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Override the renderer's default precision for this material. Can be \\"highp\\", \\"mediump\\" or \\"lowp\\". Defaults is null.",
          "kind": "union",
          "name": "precision",
          "required": true,
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
          "kind": "boolean",
          "name": "premultipliedAlpha",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "The bit mask to use when comparing against the stencil buffer. Default is *0xFF*.",
          "kind": "number",
          "name": "stencilFuncMask",
          "required": true,
          "tags": {
            "default": 255,
          },
        },
        {
          "description": "The value to use when performing stencil comparisons or stencil operations. Default is *0*.",
          "kind": "number",
          "name": "stencilRef",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
        {
          "description": "Whether rendering this material has any effect on the stencil buffer. Default is *false*.",
          "kind": "boolean",
          "name": "stencilWrite",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "The bit mask to use when writing to the stencil buffer. Default is *0xFF*.",
          "kind": "number",
          "name": "stencilWriteMask",
          "required": true,
          "tags": {
            "default": 255,
          },
        },
        {
          "description": "Defines whether this material is tone mapped according to the renderer's toneMapping setting.
      Default is true.",
          "kind": "boolean",
          "name": "toneMapped",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Defines whether vertex coloring is used. Default is false.",
          "kind": "boolean",
          "name": "vertexColors",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "kind": "boolean",
          "name": "wireframe",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": undefined,
          "kind": "string",
          "name": "wireframeLinecap",
          "required": true,
          "tags": {
            "default": "'round'",
          },
        },
        {
          "description": undefined,
          "kind": "string",
          "name": "wireframeLinejoin",
          "required": true,
          "tags": {
            "default": "'round'",
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "wireframeLinewidth",
          "required": true,
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
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[1]).toMatchInlineSnapshot(`
      {
        "column": 36,
        "description": undefined,
        "kind": "union",
        "line": 25,
        "name": "scale",
        "required": false,
        "shape": [
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
          {
            "kind": "number",
          },
        ],
        "tags": {},
        "value": [
          1,
          1,
          1,
        ],
        "valueKind": "array",
      }
    `);
  });

  it("should extract a declared tuple prop and mark them as required", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[0]).toMatchInlineSnapshot(`
      {
        "column": 15,
        "description": undefined,
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
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
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
        },
        {
          "description": undefined,
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
              "kind": "union",
              "label": "material",
              "required": false,
              "shape": [],
            },
          ],
          "tags": {},
        },
        {
          "description": "Optional name of the object (doesn't need to be unique).",
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {
            "default": "''",
          },
        },
        {
          "column": 11,
          "description": "Object gets rendered if true.",
          "kind": "boolean",
          "line": 10,
          "name": "visible",
          "required": true,
          "tags": {
            "default": true,
          },
          "value": true,
          "valueKind": "boolean",
        },
        {
          "description": "Gets rendered into shadow map.",
          "kind": "boolean",
          "name": "castShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Material gets baked in shadow receiving.",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "kind": "union",
          "name": "material",
          "required": true,
          "shape": [],
          "tags": {},
        },
        {
          "description": undefined,
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
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "kind": "number",
          "name": "renderOrder",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
      ]
    `);
  });

  it("should extract explicit boolean props", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/with-comments.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 20, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "description": undefined,
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
        },
        {
          "description": undefined,
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
              "kind": "union",
              "label": "material",
              "required": false,
              "shape": [],
            },
          ],
          "tags": {},
        },
        {
          "description": "Optional name of the object (doesn't need to be unique).",
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {
            "default": "''",
          },
        },
        {
          "column": 11,
          "description": "Object gets rendered if true.",
          "kind": "boolean",
          "line": 20,
          "name": "visible",
          "required": true,
          "tags": {
            "default": true,
          },
          "value": true,
          "valueKind": "boolean",
        },
        {
          "column": 26,
          "description": "Gets rendered into shadow map.",
          "kind": "boolean",
          "line": 20,
          "name": "castShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
          "value": false,
          "valueKind": "boolean",
        },
        {
          "description": "Material gets baked in shadow receiving.",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "kind": "union",
          "name": "material",
          "required": true,
          "shape": [],
          "tags": {},
        },
        {
          "description": undefined,
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
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "kind": "number",
          "name": "renderOrder",
          "required": true,
          "tags": {
            "default": 0,
          },
        },
      ]
    `);
  });

  it("should merge props and types for rounded box", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 25, 10);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props[5]).toMatchInlineSnapshot(`
      {
        "column": 22,
        "description": "Object gets rendered if true.",
        "kind": "boolean",
        "line": 25,
        "name": "visible",
        "required": true,
        "tags": {
          "default": true,
        },
        "value": undefined,
        "valueKind": "undefined",
      }
    `);
    expect(props[3]).toMatchInlineSnapshot(`
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

  it("should extract union type from string literal", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 41, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 12,
          "description": undefined,
          "kind": "union",
          "line": 41,
          "name": "color",
          "required": true,
          "shape": [
            {
              "kind": "string",
              "literal": "white",
            },
            {
              "kind": "string",
              "literal": "black",
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
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 42, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "description": undefined,
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
      join(__dirname, "__mocks__/box.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 17, 5);

    const { props } = getJsxElementProps(sourceFile, sceneObject!);

    expect(props).toMatchInlineSnapshot(`
      [
        {
          "column": 11,
          "description": undefined,
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
          "column": 51,
          "description": undefined,
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
          "column": 31,
          "description": undefined,
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
          "description": undefined,
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
              "kind": "union",
              "label": "material",
              "required": false,
              "shape": [],
            },
          ],
          "tags": {},
        },
        {
          "description": "Optional name of the object (doesn't need to be unique).",
          "kind": "string",
          "name": "name",
          "required": true,
          "tags": {
            "default": "''",
          },
        },
        {
          "description": "Object gets rendered if true.",
          "kind": "boolean",
          "name": "visible",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": "Gets rendered into shadow map.",
          "kind": "boolean",
          "name": "castShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "Material gets baked in shadow receiving.",
          "kind": "boolean",
          "name": "receiveShadow",
          "required": true,
          "tags": {
            "default": "false",
          },
        },
        {
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "kind": "boolean",
          "name": "frustumCulled",
          "required": true,
          "tags": {
            "default": true,
          },
        },
        {
          "description": undefined,
          "kind": "number",
          "name": "layers",
          "required": false,
          "tags": {},
        },
        {
          "description": undefined,
          "kind": "union",
          "name": "material",
          "required": true,
          "shape": [],
          "tags": {},
        },
        {
          "description": undefined,
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
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "kind": "number",
          "name": "renderOrder",
          "required": true,
          "tags": {
            "default": 0,
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
      join(__dirname, "__mocks__/scene.tsx")
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
        {
          "column": 9,
          "description": undefined,
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
      ]
    `);
  });

  it("should extract array static props from nested host jsx elements", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/nested.tsx")
    );

    const elements = getJsxElementsPositions(sourceFile, "default");

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [
                {
                  "children": [],
                  "column": 9,
                  "line": 11,
                  "name": "boxGeometry",
                  "type": "host",
                },
                {
                  "children": [],
                  "column": 9,
                  "line": 12,
                  "name": "meshBasicMaterial",
                  "type": "host",
                },
              ],
              "column": 7,
              "line": 10,
              "name": "mesh",
              "type": "host",
            },
          ],
          "column": 5,
          "line": 9,
          "name": "group",
          "type": "host",
        },
      ]
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
              "column": 7,
              "line": 10,
              "name": "geo-hi (cylinderGeometry)",
              "type": "host",
            },
            {
              "children": [],
              "column": 7,
              "line": 11,
              "name": "meshStandardMaterial",
              "type": "host",
            },
          ],
          "column": 5,
          "line": 9,
          "name": "this-is-cilly (mesh)",
          "type": "host",
        },
      ]
    `);
  });

  it("should get the tag name from a string literal for a named group", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/cylinder.tsx")
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
      join(__dirname, "__mocks__/cylinder.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 10, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const tag = getJsxTag(sceneObject);

    expect(tag.tagName).toEqual("cylinderGeometry");
    expect(tag.name).toEqual("geo-hi");
  });
});
