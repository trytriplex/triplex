/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { Fragment } from "react";
import { render } from "react-three-test";
import { MapControls } from "triplex-drei";
import { describe, expect, it } from "vitest";
import { SceneElement } from "../";
import { getTriplexMeta, resolveElementMeta } from "../../../util/meta";
import { Camera } from "../../camera";
import { findObject3D } from "../../selection-three-fiber/resolver";
import { SceneObjectContext } from "../context";
import { nested } from "./__stubs__/scene-objects";

describe("scene object component", () => {
  it("should forcibly disable scroll controls when viewing through triplex camera", async () => {
    const { toTree } = await render(
      <SceneObjectContext.Provider value={true}>
        <Camera>
          <SceneElement
            __component={(props: unknown) => <mesh userData={{ props }} />}
            __meta={{
              column: 1,
              exportName: "Component",
              line: 1,
              name: "ScrollControls",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </Camera>
      </SceneObjectContext.Provider>,
    );

    const tree = toTree();

    expect(tree?.[0].props.userData.props.enabled).toBe(false);
  });

  it("should enable scroll controls when viewing through userland camera", async () => {
    const { toTree } = await render(
      <SceneObjectContext.Provider value={true}>
        <Camera defaultCamera="user">
          <SceneElement
            __component={(props: unknown) => <mesh userData={{ props }} />}
            __meta={{
              column: 1,
              exportName: "Component",
              line: 1,
              name: "ScrollControls",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </Camera>
      </SceneObjectContext.Provider>,
    );

    const tree = toTree();

    expect(tree?.[0].props.userData.props.enabled).toBe(undefined);
  });

  it("should not render a group", async () => {
    const { toGraph } = await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component="mesh"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "mesh",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
        />
      </SceneObjectContext.Provider>,
    );

    expect(toGraph()).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "name": "",
          "type": "Mesh",
        },
      ]
    `);
  });

  it("should attach meta scene objects", async () => {
    const ref = { current: null };

    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component="mesh"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "mesh",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
          ref={ref}
        />
      </SceneObjectContext.Provider>,
    );

    expect(getTriplexMeta(ref.current)?.name).toEqual("mesh");
  });

  it("should attach meta in order of children", async () => {
    const ref1 = { current: null };
    const ref2 = { current: null };
    const ref3 = { current: null };

    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component="group"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "group-1",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
          ref={ref1}
        >
          <SceneElement
            __component="group"
            __meta={{
              column: 1,
              exportName: "Component",
              line: 2,
              name: "group-2",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
            ref={ref2}
          />
          <SceneElement
            __component="group"
            __meta={{
              column: 1,
              exportName: "Component",
              line: 3,
              name: "group-3",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
            ref={ref3}
          />
        </SceneElement>
      </SceneObjectContext.Provider>,
    );

    expect(getTriplexMeta(ref1.current)?.name).toEqual("group-1");
    expect(getTriplexMeta(ref2.current)?.name).toEqual("group-2");
    expect(getTriplexMeta(ref3.current)?.name).toEqual("group-3");
  });

  it("should reconcile an object 3d to its custom component", async () => {
    const ref = { current: null };
    function Component() {
      return (
        <SceneElement
          __component="mesh"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "mesh",
            path: "/bar",
            rotate: false,
            scale: false,
            translate: false,
          }}
          ref={ref}
        />
      );
    }

    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component={Component}
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "Component",
            path: "/foo",
            rotate: false,
            scale: false,
            translate: false,
          }}
        />
      </SceneObjectContext.Provider>,
    );

    expect(
      resolveElementMeta(ref.current!, {
        exportName: "Component",
        path: "/foo",
      }),
    ).toMatchObject({
      column: 1,
      line: 1,
      name: "Component",
    });
  });

  it("should not render an attached element as a scene object", async () => {
    let error: Error | undefined = undefined;

    try {
      await render(
        <SceneObjectContext.Provider value={true}>
          <SceneElement
            __component="directionalLight"
            __meta={{
              column: 10,
              exportName: "Component",
              line: 99,
              name: "directionalLight",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
          >
            <SceneElement
              __component="orthographicCamera"
              __meta={{
                column: 10,
                exportName: "Component",
                line: 100,
                name: "orthographicCamera",
                path: "",
                rotate: false,
                scale: false,
                translate: false,
              }}
              attach="shadow-camera"
            />
          </SceneElement>
        </SceneObjectContext.Provider>,
      );
    } catch (error_) {
      error = error_ as Error;
    } finally {
      expect(error).toBeUndefined();
    }
  });

  it("should resolve the highest component of the object 3d of specified path", async () => {
    const ref = { current: null };
    function Component({ children }: { children: React.ReactNode }) {
      return (
        <SceneElement
          __component="mesh"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "mesh",
            path: "/foo",
            rotate: false,
            scale: false,
            translate: false,
          }}
          ref={ref}
        >
          {children}
        </SceneElement>
      );
    }
    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component={Fragment}
          __meta={{
            column: 1,
            exportName: "ComponentA",
            line: 1,
            name: "ComponentA",
            path: "/bar",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneElement
            __component={Component}
            __meta={{
              column: 1,
              exportName: "ComponentB",
              line: 2,
              name: "ComponentB",
              path: "/foo",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </SceneElement>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveElementMeta(ref.current!, {
      exportName: "ComponentB",
      path: "/foo",
    });

    expect(actual).toMatchObject({
      column: 1,
      line: 2,
      name: "ComponentB",
    });
  });

  it("should resolve the transformed object 3d", async () => {
    const ref = { current: null };
    function Component({ children }: { children: React.ReactNode }) {
      return (
        <SceneElement
          __component="group"
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "group",
            path: "/foo",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneElement
            __component="mesh"
            __meta={{
              column: 1,
              exportName: "Component",
              line: 1,
              name: "mesh",
              path: "/foo",
              rotate: false,
              scale: false,
              translate: true,
            }}
            ref={ref}
          >
            {children}
          </SceneElement>
        </SceneElement>
      );
    }
    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneElement
          __component={Fragment}
          __meta={{
            column: 1,
            exportName: "Comp1",
            line: 1,
            name: "ComponentA",
            path: "/bar",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneElement
            __component={Component}
            __meta={{
              column: 1,
              exportName: "Comp1",
              line: 2,
              name: "ComponentB",
              path: "/bar",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </SceneElement>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveElementMeta(ref.current!, {
      exportName: "Comp1",
      path: "/bar",
    });

    expect(actual).toMatchObject({
      column: 1,
      line: 2,
      name: "ComponentB",
    });
  });

  it("should find host scene object using meta", async () => {
    const { scene } = await render(nested());

    const [[object]] = findObject3D(scene.instance, {
      column: 22,
      line: 1,
      path: "/foo",
    });
    const meta = getTriplexMeta(object);

    expect(meta).toMatchObject({ path: "/foo" });
  });

  it("should find custom component highest scene object using meta", async () => {
    const { scene } = await render(nested());

    const [[object]] = findObject3D(scene.instance, {
      column: 10,
      line: 20,
      path: "/bar",
    });
    const meta = getTriplexMeta(object);

    expect(meta).toMatchObject({
      column: 1,
      line: 1,
      name: "group",
      path: "/foo",
    });
  });

  it("should not render userland controls when triplex camera is active", async () => {
    const { tree } = await render(
      <Camera>
        <SceneElement
          __component={MapControls}
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "MapControls",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
        />
      </Camera>,
    );

    expect(tree.getByName("__stub_map_controls__")).toBeUndefined();
  });

  it("should render userland controls when triplex camera is not active", async () => {
    const { act, tree } = await render(
      <Camera>
        <SceneElement
          __component={MapControls}
          __meta={{
            column: 1,
            exportName: "Component",
            line: 1,
            name: "MapControls",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
        />
      </Camera>,
    );

    await act(() => {
      return send(
        "request-state-change",
        { camera: "default", state: "play" },
        true,
      );
    });

    expect(tree.getByName("__stub_map_controls__")).toBeDefined();
  });
});
