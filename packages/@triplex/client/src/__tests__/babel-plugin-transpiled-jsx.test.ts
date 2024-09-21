/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { transformSync as babelTransformSync } from "@babel/core";
import { describe, expect, it } from "vitest";
import plugin from "../babel-plugin";

const transformSync = (code: string) => {
  const result = babelTransformSync(code, {
    plugins: [plugin({ exclude: [] })],
  });
  if (!result) {
    return null;
  }

  return {
    ...result,
    code: result.code?.replace(/[A-Z]:\\\\/g, "/"),
  };
};

describe("transform transpiled jsx", () => {
  it("should skip document.createElement 1 arg", () => {
    const actual = transformSync(`
      document.createElement("div");
    `);

    expect(actual?.code).toMatchInlineSnapshot(`"document.createElement("div");"`);
  });

  it("should skip document.createElement 2 arg", () => {
    const actual = transformSync(`
      document.createElement('div', {});
    `);

    expect(actual?.code).toMatchInlineSnapshot(
      "\"document.createElement('div', {});\"",
    );
  });

  it("should transform create element member expression", () => {
    const actual = transformSync(`
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "perspectiveCamera",
          s.default({ ref: f.default([p, o]) }, i),
          !y && c
        ),
        React.createElement("group", { ref: g }, y && c(h.texture))
      )
    `);

    expect(actual?.code).toMatchInlineSnapshot(`
      "React.createElement(SceneObject, {
        ...null,
        __component: React.Fragment,
        __meta: {
          "path": "",
          "name": "unknown",
          "line": -2,
          "column": -2
        }
      }, React.createElement(SceneObject, {
        ...s.default({
          ref: f.default([p, o])
        }, i),
        __component: "perspectiveCamera",
        __meta: {
          "path": "",
          "name": "perspectiveCamera",
          "line": -2,
          "column": -2
        }
      }, !y && c), React.createElement(SceneObject, {
        ...{
          ref: g
        },
        __component: "group",
        __meta: {
          "path": "",
          "name": "group",
          "line": -2,
          "column": -2
        }
      }, y && c(h.texture)));"
    `);
  });

  it("should transform jsx automatic identifier cjs", () => {
    const actual = transformSync(`
      jsxs("group", {
        children: [
          jsx(Mesh, {
            position: [0, 0, 0],
          }),
        ],
      });
    `);

    expect(actual?.code).toMatchInlineSnapshot(`
      "jsxs(SceneObject, {
        children: [jsx(SceneObject, {
          position: [0, 0, 0],
          __component: Mesh,
          __meta: {
            "path": "",
            "name": "unknown",
            "line": -2,
            "column": -2
          }
        })],
        __component: "group",
        __meta: {
          "path": "",
          "name": "group",
          "line": -2,
          "column": -2
        }
      });"
    `);
  });

  it("should transform jsx automatic identifier esm", () => {
    const actual = transformSync(`
      jsxRuntime.jsxs("group", {
        children: [
          jsxRuntime.jsx("mesh", {
            position: [0, 0, 0],
          }),
        ],
      });
    `);

    expect(actual?.code).toMatchInlineSnapshot(`
      "jsxRuntime.jsxs(SceneObject, {
        children: [jsxRuntime.jsx(SceneObject, {
          position: [0, 0, 0],
          __component: "mesh",
          __meta: {
            "path": "",
            "name": "mesh",
            "line": -2,
            "column": -2
          }
        })],
        __component: "group",
        __meta: {
          "path": "",
          "name": "group",
          "line": -2,
          "column": -2
        }
      });"
    `);
  });

  it("should transform uikit jsx", () => {
    const actual = transformSync(`
      (_jsxs(InteractionGroup, { groupRef: groupRef, matrix: transformMatrix, handlers: properties, hoverHandlers: hoverHandlers, activeHandlers: activeHandlers, children: [_jsx(ScrollHandler, { listeners: properties, node: node, scrollPosition: scrollPosition, children: _jsx("primitive", { object: interactionPanel }) }), _jsx(ChildrenProvider, { globalMatrix: globalMatrix, node: node, orderInfo: orderInfo, scrollPosition: scrollPosition, children: properties.children })] }))
    `);

    expect(actual?.code).toMatchInlineSnapshot(`
      "_jsxs(SceneObject, {
        groupRef: groupRef,
        matrix: transformMatrix,
        handlers: properties,
        hoverHandlers: hoverHandlers,
        activeHandlers: activeHandlers,
        children: [_jsx(SceneObject, {
          listeners: properties,
          node: node,
          scrollPosition: scrollPosition,
          children: _jsx(SceneObject, {
            object: interactionPanel,
            __component: "primitive",
            __meta: {
              "path": "",
              "name": "primitive",
              "line": -2,
              "column": -2
            }
          }),
          __component: ScrollHandler,
          __meta: {
            "path": "",
            "name": "unknown",
            "line": -2,
            "column": -2
          }
        }), _jsx(SceneObject, {
          globalMatrix: globalMatrix,
          node: node,
          orderInfo: orderInfo,
          scrollPosition: scrollPosition,
          children: properties.children,
          __component: ChildrenProvider,
          __meta: {
            "path": "",
            "name": "unknown",
            "line": -2,
            "column": -2
          }
        })],
        __component: InteractionGroup,
        __meta: {
          "path": "",
          "name": "unknown",
          "line": -2,
          "column": -2
        }
      });"
    `);
  });

  it("should transform mangled jsx", () => {
    const actual = transformSync(`
      (0, import_jsx_runtime6.jsxs)(InteractionGroup, { groupRef, matrix: transformMatrix, handlers: properties, hoverHandlers, activeHandlers, children: [(0, import_jsx_runtime6.jsx)("primitive", { object: interactionPanel }), (0, import_jsx_runtime6.jsx)("group", { matrixAutoUpdate: false, ref: outerGroupRef, children: (0, import_jsx_runtime6.jsx)("group", { ref: innerGroupRef, matrixAutoUpdate: false, children: (0, import_jsx_runtime6.jsx)(FlexProvider, { value: void 0, children: properties.children }) }) })] })
    `);

    expect(actual?.code).toMatchInlineSnapshot(`
      "(0, import_jsx_runtime6.jsxs)(SceneObject, {
        groupRef,
        matrix: transformMatrix,
        handlers: properties,
        hoverHandlers,
        activeHandlers,
        children: [(0, import_jsx_runtime6.jsx)(SceneObject, {
          object: interactionPanel,
          __component: "primitive",
          __meta: {
            "path": "",
            "name": "primitive",
            "line": -2,
            "column": -2
          }
        }), (0, import_jsx_runtime6.jsx)(SceneObject, {
          matrixAutoUpdate: false,
          ref: outerGroupRef,
          children: (0, import_jsx_runtime6.jsx)(SceneObject, {
            ref: innerGroupRef,
            matrixAutoUpdate: false,
            children: (0, import_jsx_runtime6.jsx)(SceneObject, {
              value: void 0,
              children: properties.children,
              __component: FlexProvider,
              __meta: {
                "path": "",
                "name": "unknown",
                "line": -2,
                "column": -2
              }
            }),
            __component: "group",
            __meta: {
              "path": "",
              "name": "group",
              "line": -2,
              "column": -2
            }
          }),
          __component: "group",
          __meta: {
            "path": "",
            "name": "group",
            "line": -2,
            "column": -2
          }
        })],
        __component: InteractionGroup,
        __meta: {
          "path": "",
          "name": "unknown",
          "line": -2,
          "column": -2
        }
      });"
    `);
  });
});
