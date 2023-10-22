/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { MemoryRouter } from "react-router-dom";
import { render } from "react-three-test";
import { describe, expect, it } from "vitest";
import { ComponentProvider } from "../context";
import { SceneObject } from "../scene-object";

describe("scene object component", () => {
  it("should render the component inside a group", async () => {
    const { toGraph } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <SceneObject
            __component="mesh"
            __meta={{
              column: 1,
              line: 1,
              name: "mesh",
              path: "",
              rotate: true,
              scale: true,
              translate: true,
            }}
          />
        </ComponentProvider>
      </MemoryRouter>
    );

    expect(toGraph()).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": [],
              "name": "",
              "type": "Mesh",
            },
          ],
          "name": "",
          "type": "Group",
        },
      ]
    `);
  });

  it("should not render an attached element as a scene object", async () => {
    let error: Error | undefined = undefined;

    try {
      await render(
        <MemoryRouter>
          <ComponentProvider value={{}}>
            <SceneObject
              __component="directionalLight"
              __meta={{
                column: 10,
                line: 99,
                name: "directionalLight",
                path: "",
                rotate: false,
                scale: false,
                translate: false,
              }}
            >
              <SceneObject
                __component="orthographicCamera"
                __meta={{
                  column: 10,
                  line: 100,
                  name: "orthographicCamera",
                  path: "",
                  rotate: true,
                  scale: true,
                  translate: true,
                }}
                attach="shadow-camera"
              />
            </SceneObject>
          </ComponentProvider>
        </MemoryRouter>
      );
    } catch (error_) {
      error = error_ as Error;
    } finally {
      expect(error).toBeUndefined();
    }
  });

  it("should inject a box geometry to the mesh scene object", async () => {
    const { act, tree } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <SceneObject
            __component="mesh"
            __meta={{
              column: 10,
              line: 100,
              name: "mesh",
              path: "box.tsx",
              rotate: true,
              scale: true,
              translate: true,
            }}
          />
        </ComponentProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await send(
        "trplx:requestAddNewComponent",
        {
          target: {
            action: "child",
            column: 10,
            exportName: "default",
            line: 100,
            path: "box.tsx",
          },
          type: {
            name: "boxGeometry",
            props: { args: [1, 2, 3] },
            type: "host",
          },
        },
        true
      );
    });

    expect(tree.getByType("boxGeometry").props).toMatchInlineSnapshot(`
      {
        "args": [
          1,
          2,
          3,
        ],
      }
    `);
  });
});
