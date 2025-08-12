/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { transformSync as babelTransformSync } from "@babel/core";
import { describe, expect, it } from "vitest";
import plugin from "../babel-plugin";

const transform = (code: TemplateStringsArray) => {
  const result = babelTransformSync(code[0], {
    plugins: [
      plugin({ exclude: ["/hello.tsx"] }),
      require.resolve("@babel/plugin-syntax-jsx"),
    ],
  });
  if (!result) {
    throw new Error("invariant");
  }

  return result.code?.replace(/[A-z]:\//g, "/");
};

describe("ignored elements", () => {
  it("should skip wrapping react router elements as they are not composable", () => {
    const actual = transform`
      import { BrowserRouter, Route, Routes } from "react-router";

      function App() {
        return (
          <BrowserRouter>
            <Routes>
              <Route index />
              <Route path="about" />
            </Routes>
          </BrowserRouter>
        );
      }
    `;

    expect(actual).toMatchInlineSnapshot(`
      "import { BrowserRouter, Route, Routes } from "react-router";
      function App() {
        return <SceneObject __component={BrowserRouter} __meta={{
          "astPath": "root/BrowserRouter",
          "originExportName": "BrowserRouter",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "BrowserRouter",
          "line": 6,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}>
                  <Routes>
                    <Route index />
                    <Route path="about" />
                  </Routes>
                </SceneObject>;
      }
      App.triplexMeta = {
        "lighting": "default",
        "root": "react"
      };"
    `);
  });
});
