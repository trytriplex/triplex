/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { Fragment } from "react/jsx-runtime";
import { describe, expect, it } from "vitest";
import { SceneElement } from "../../scene-element";
import { SceneObjectContext } from "../../scene-element/context";
import { resolveDOMNodes } from "../resolver";

describe("DOM resolver", () => {
  it("should resolve single main parent node", () => {
    render(
      <SceneObjectContext.Provider value>
        <SceneElement
          __component="main"
          __meta={{
            astPath: "root/main",
            column: 4,
            exportName: "",
            line: 1,
            name: "main",
            path: "/baz",
          }}
        >
          <SceneElement
            __component="div"
            __meta={{
              astPath: "root/main/div",
              column: 4,
              exportName: "",
              line: 2,
              name: "div",
              path: "/foo",
            }}
          />
          <SceneElement
            __component="span"
            __meta={{
              astPath: "root/main/span",
              column: 4,
              exportName: "",
              line: 3,
              name: "span",
              path: "/foo",
            }}
          />
        </SceneElement>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveDOMNodes([
      {
        astPath: "root/main",
        column: 4,
        line: 1,
        parentPath: "/baz",
        path: "/baz",
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "meta": {
            "astPath": "root/main",
            "column": 4,
            "exportName": "",
            "line": 1,
            "name": "main",
            "parents": [],
            "path": "/baz",
            "props": {
              "current": {},
            },
          },
          "node": <main>
            <div />
            <span />
          </main>,
        },
      ]
    `);
  });

  it("should resolve sibling nodes inside a fragment node", () => {
    render(
      <SceneObjectContext.Provider value>
        <SceneElement
          __component={Fragment}
          __meta={{
            astPath: "root/Fragment",
            column: 4,
            exportName: "",
            line: 1,
            name: "Fragment",
            path: "/baz",
          }}
        >
          <SceneElement
            __component="div"
            __meta={{
              astPath: "root/Fragment/div",
              column: 4,
              exportName: "",
              line: 2,
              name: "div",
              path: "/foo",
            }}
          />
          <SceneElement
            __component="span"
            __meta={{
              astPath: "root/Fragment/span",
              column: 4,
              exportName: "",
              line: 3,
              name: "span",
              path: "/foo",
            }}
          />
        </SceneElement>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveDOMNodes([
      {
        astPath: "root/Fragment",
        column: 4,
        line: 1,
        parentPath: "/baz",
        path: "/baz",
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      [
        {
          "meta": {
            "astPath": "root/Fragment",
            "column": 4,
            "exportName": "",
            "line": 1,
            "name": "Fragment",
            "parents": [],
            "path": "/baz",
            "props": {
              "current": {},
            },
          },
          "node": <div />,
        },
        {
          "meta": {
            "astPath": "root/Fragment",
            "column": 4,
            "exportName": "",
            "line": 1,
            "name": "Fragment",
            "parents": [],
            "path": "/baz",
            "props": {
              "current": {},
            },
          },
          "node": <span />,
        },
      ]
    `);
  });
});
