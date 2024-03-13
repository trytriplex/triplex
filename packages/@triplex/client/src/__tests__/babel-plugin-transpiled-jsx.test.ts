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

    expect(actual?.code).toMatchInlineSnapshot(`
      "document.createElement(\\"div\\");"
    `);
  });

  it("should skip document.createElement 2 arg", () => {
    const actual = transformSync(`
      document.createElement('div', {});
    `);

    expect(actual?.code).toMatchInlineSnapshot(
      "\"document.createElement('div', {});\""
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
          \\"path\\": \\"\\",
          \\"name\\": \\"unknown\\",
          \\"line\\": -2,
          \\"column\\": -2
        }
      }, React.createElement(SceneObject, {
        ...s.default({
          ref: f.default([p, o])
        }, i),
        __component: \\"perspectiveCamera\\",
        __meta: {
          \\"path\\": \\"\\",
          \\"name\\": \\"perspectiveCamera\\",
          \\"line\\": -2,
          \\"column\\": -2
        }
      }, !y && c), React.createElement(SceneObject, {
        ...{
          ref: g
        },
        __component: \\"group\\",
        __meta: {
          \\"path\\": \\"\\",
          \\"name\\": \\"group\\",
          \\"line\\": -2,
          \\"column\\": -2
        }
      }, y && c(h.texture)));"
    `);
  });

  it.todo("should transform jsx automatic identifier", () => {});

  it.todo("should transform jsxs automatic identifier", () => {});
});
