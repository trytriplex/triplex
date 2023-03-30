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

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "declaration": "declared",
          "description": undefined,
          "line": 12,
          "name": "args",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "number",
              "value": 1,
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "name",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "morphTargetsRelative",
          "required": true,
          "type": "boolean",
          "value": false,
        },
      ]
    `);
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

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "declaration": "undeclared",
          "description": "Material name. Default is an empty string.",
          "name": "name",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "declaration": "undeclared",
          "description": "Defines whether this material is visible. Default is true.",
          "name": "visible",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "column": 29,
          "declaration": "declared",
          "description": undefined,
          "line": 13,
          "name": "color",
          "required": true,
          "type": "union",
          "value": "pink",
          "values": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
            {
              "type": "tuple",
              "values": [
                {
                  "type": "number",
                },
                {
                  "type": "number",
                },
                {
                  "type": "number",
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": "Opacity. Default is 1.",
          "name": "opacity",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Defines whether this material is transparent. This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
      When set to true, the extent to which the material is transparent is controlled by setting it's .opacity property.
      Default is false.",
          "name": "transparent",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "metalness",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "roughness",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Sets the alpha value to be used when running an alpha test. Default is 0.",
          "name": "alphaTest",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Enables alpha to coverage. Can only be used with MSAA-enabled rendering contexts.",
          "name": "alphaToCoverage",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "aoMapIntensity",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "The tranparency of the .blendDst. Default is null.",
          "name": "blendDstAlpha",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "The tranparency of the .blendEquation. Default is null.",
          "name": "blendEquationAlpha",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Blending source. It's one of the blending mode constants defined in Three.js. Default is {@link SrcAlphaFactor}.",
          "name": "blendSrc",
          "required": true,
          "type": "union",
          "value": "",
          "values": [],
        },
        {
          "declaration": "undeclared",
          "description": "The tranparency of the .blendSrc. Default is null.",
          "name": "blendSrcAlpha",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "bumpScale",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Changes the behavior of clipping planes so that only their intersection is clipped, rather than their union. Default is false.",
          "name": "clipIntersection",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Defines whether to clip shadows according to the clipping planes specified on this material. Default is false.",
          "name": "clipShadows",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Whether to render the material's color. This can be used in conjunction with a mesh's .renderOrder property to create invisible objects that occlude other objects. Default is true.",
          "name": "colorWrite",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Whether to have depth test enabled when rendering this material. Default is true.",
          "name": "depthTest",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Whether rendering this material has any effect on the depth buffer. Default is true.
      When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.",
          "name": "depthWrite",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "displacementBias",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "displacementScale",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Whether to apply dithering to the color to remove the appearance of banding. Default is false.",
          "name": "dithering",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "emissive",
          "required": true,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "string",
              "value": "",
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "array",
              "value": [
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "emissiveIntensity",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "envMapIntensity",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Define whether the material is rendered with flat shading. Default is false.",
          "name": "flatShading",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Whether the material is affected by fog. Default is true.",
          "name": "fog",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "lightMapIntensity",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Whether to use polygon offset. Default is false. This corresponds to the POLYGON_OFFSET_FILL WebGL feature.",
          "name": "polygonOffset",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Sets the polygon offset factor. Default is 0.",
          "name": "polygonOffsetFactor",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Sets the polygon offset units. Default is 0.",
          "name": "polygonOffsetUnits",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Override the renderer's default precision for this material. Can be \\"highp\\", \\"mediump\\" or \\"lowp\\". Defaults is null.",
          "name": "precision",
          "required": true,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "string",
              "value": "highp",
            },
            {
              "type": "string",
              "value": "mediump",
            },
            {
              "type": "string",
              "value": "lowp",
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": "Whether to premultiply the alpha (transparency) value. See WebGL / Materials / Transparency for an example of the difference. Default is false.",
          "name": "premultipliedAlpha",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "The bit mask to use when comparing against the stencil buffer. Default is *0xFF*.",
          "name": "stencilFuncMask",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "The value to use when performing stencil comparisons or stencil operations. Default is *0*.",
          "name": "stencilRef",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Whether rendering this material has any effect on the stencil buffer. Default is *false*.",
          "name": "stencilWrite",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "The bit mask to use when writing to the stencil buffer. Default is *0xFF*.",
          "name": "stencilWriteMask",
          "required": true,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": "Defines whether this material is tone mapped according to the renderer's toneMapping setting.
      Default is true.",
          "name": "toneMapped",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Defines whether vertex coloring is used. Default is false.",
          "name": "vertexColors",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "wireframe",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "wireframeLinecap",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "wireframeLinejoin",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "wireframeLinewidth",
          "required": true,
          "type": "number",
          "value": 0,
        },
      ]
    `);
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

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "position",
          "required": false,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "array",
              "value": [
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "scale",
          "required": false,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "array",
              "value": [
                {
                  "type": "number",
                  "value": 1,
                },
                {
                  "type": "number",
                  "value": 1,
                },
                {
                  "type": "number",
                  "value": 1,
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "rotation",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
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
        {
          "declaration": "undeclared",
          "description": "Optional name of the object (doesn't need to be unique).",
          "name": "name",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "column": 11,
          "declaration": "declared",
          "description": "Object gets rendered if true.",
          "line": 4,
          "name": "visible",
          "required": true,
          "type": "boolean",
          "value": true,
        },
        {
          "declaration": "undeclared",
          "description": "Gets rendered into shadow map.",
          "name": "castShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Material gets baked in shadow receiving.",
          "name": "receiveShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "name": "frustumCulled",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "layers",
          "required": false,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "material",
          "required": true,
          "type": "union",
          "value": "",
          "values": [],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "quaternion",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "name": "renderOrder",
          "required": true,
          "type": "number",
          "value": 0,
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
    const sceneObject = getJsxElementAt(sourceFile, 14, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "position",
          "required": false,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "array",
              "value": [
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
                {
                  "type": "number",
                  "value": 0,
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "scale",
          "required": false,
          "type": "union",
          "value": "",
          "values": [
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "array",
              "value": [
                {
                  "type": "number",
                  "value": 1,
                },
                {
                  "type": "number",
                  "value": 1,
                },
                {
                  "type": "number",
                  "value": 1,
                },
              ],
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "rotation",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
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
        {
          "declaration": "undeclared",
          "description": "Optional name of the object (doesn't need to be unique).",
          "name": "name",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "column": 11,
          "declaration": "declared",
          "description": "Object gets rendered if true.",
          "line": 14,
          "name": "visible",
          "required": true,
          "type": "boolean",
          "value": true,
        },
        {
          "column": 26,
          "declaration": "declared",
          "description": "Gets rendered into shadow map.",
          "line": 14,
          "name": "castShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Material gets baked in shadow receiving.",
          "name": "receiveShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "name": "frustumCulled",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "layers",
          "required": false,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "material",
          "required": true,
          "type": "union",
          "value": "",
          "values": [],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "quaternion",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "name": "renderOrder",
          "required": true,
          "type": "number",
          "value": 0,
        },
      ]
    `);
  });

  it("should extract union type from string literal", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/type-extraction.tsx")
    );
    const sceneObject = getJsxElementAt(sourceFile, 35, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "column": 12,
          "declaration": "declared",
          "description": undefined,
          "line": 35,
          "name": "color",
          "required": true,
          "type": "union",
          "value": "black",
          "values": [
            {
              "type": "string",
              "value": "black",
            },
            {
              "type": "string",
              "value": "white",
            },
          ],
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
    const sceneObject = getJsxElementAt(sourceFile, 36, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "column": 20,
          "declaration": "declared",
          "description": undefined,
          "line": 36,
          "name": "color",
          "required": false,
          "type": "union",
          "value": undefined,
          "values": [
            {
              "type": "string",
              "value": "black",
            },
            {
              "type": "string",
              "value": "white",
            },
          ],
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
    const sceneObject = getJsxElementAt(sourceFile, 11, 5);

    const elements = getJsxElementProps(sourceFile, sceneObject!);

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "column": 11,
          "declaration": "declared",
          "description": undefined,
          "line": 11,
          "name": "position",
          "required": false,
          "type": "identifier",
          "value": "position",
        },
        {
          "column": 51,
          "declaration": "declared",
          "description": undefined,
          "line": 11,
          "name": "scale",
          "required": false,
          "type": "identifier",
          "value": "scale",
        },
        {
          "column": 31,
          "declaration": "declared",
          "description": undefined,
          "line": 11,
          "name": "rotation",
          "required": false,
          "type": "identifier",
          "value": "rotation",
        },
        {
          "declaration": "undeclared",
          "description": "Optional name of the object (doesn't need to be unique).",
          "name": "name",
          "required": true,
          "type": "string",
          "value": "",
        },
        {
          "declaration": "undeclared",
          "description": "Object gets rendered if true.",
          "name": "visible",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Gets rendered into shadow map.",
          "name": "castShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "Material gets baked in shadow receiving.",
          "name": "receiveShadow",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": "When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
      If set to false the object gets rendered every frame even if it is not in the frustum of the camera.",
          "name": "frustumCulled",
          "required": true,
          "type": "boolean",
          "value": false,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "layers",
          "required": false,
          "type": "number",
          "value": 0,
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "material",
          "required": true,
          "type": "union",
          "value": "",
          "values": [],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "quaternion",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 0,
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": "Overrides the default rendering order of scene graph objects, from lowest to highest renderOrder.
      Opaque and transparent objects remain sorted independently though.
      When this property is set for an instance of Group, all descendants objects will be sorted and rendered together.",
          "name": "renderOrder",
          "required": true,
          "type": "number",
          "value": 0,
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
    const sceneObject = getJsxElementAt(sourceFile, 19, 7);
    if (!sceneObject) {
      throw new Error("not found");
    }

    const elements = getJsxElementProps(sourceFile, sceneObject);

    expect(elements).toMatchInlineSnapshot(`
      [
        {
          "column": 9,
          "declaration": "declared",
          "description": undefined,
          "line": 20,
          "name": "position",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 0.9223319881614562,
            },
            {
              "type": "number",
              "value": 0,
            },
            {
              "type": "number",
              "value": 4.703084245305494,
            },
          ],
        },
        {
          "declaration": "undeclared",
          "description": undefined,
          "name": "scale",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "number",
              "value": 1,
            },
            {
              "type": "number",
              "value": 1,
            },
          ],
        },
        {
          "column": 9,
          "declaration": "declared",
          "description": undefined,
          "line": 21,
          "name": "rotation",
          "required": false,
          "type": "array",
          "value": [
            {
              "type": "number",
              "value": 1.660031347769923,
            },
            {
              "type": "number",
              "value": -0.07873115868670048,
            },
            {
              "type": "number",
              "value": -0.7211124466452248,
            },
          ],
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
