// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { render } from "react-three-test";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SceneObject } from "../scene-object";
import { ComponentProvider } from "../context";

describe("scene object component", () => {
  it("should render the component inside a group", async () => {
    const { toGraph } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <SceneObject
            __component="mesh"
            __meta={{
              rotate: true,
              scale: true,
              translate: true,
              column: 1,
              line: 1,
              name: "mesh",
              path: "",
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

  it("should inject a box geometry to the mesh scene object", async () => {
    const { act, tree } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <SceneObject
            __component="mesh"
            __meta={{
              rotate: true,
              scale: true,
              translate: true,
              column: 10,
              line: 100,
              name: "mesh",
              path: "",
            }}
          />
        </ComponentProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await send(
        "trplx:requestAddNewComponent",
        {
          target: { action: "child", column: 10, line: 100 },
          type: {
            type: "host",
            name: "boxGeometry",
            props: { args: [1, 2, 3] },
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
