/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { MemoryRouter } from "react-router-dom";
import { render } from "react-three-test";
import { describe, expect, it } from "vitest";
import { SceneObject } from "../scene-object";

describe("scene object component", () => {
  it("should render the component inside a group", async () => {
    const { toGraph } = await render(
      <MemoryRouter>
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
        </MemoryRouter>
      );
    } catch (error_) {
      error = error_ as Error;
    } finally {
      expect(error).toBeUndefined();
    }
  });
});
