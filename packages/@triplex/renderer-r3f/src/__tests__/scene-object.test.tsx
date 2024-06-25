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
import { Camera } from "../components/camera";
import { SceneObject, SceneObjectContext } from "../scene-object";
import {
  findObject3D,
  getTriplexMeta,
  resolveObject3DMeta,
} from "../util/scene";
import { nested } from "./__stubs__/scene-objects";

describe("scene object component", () => {
  it("should not render a group", async () => {
    const { toGraph } = await render(
      <SceneObjectContext.Provider value={true}>
        <SceneObject
          __component="mesh"
          __meta={{
            column: 1,
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
        <SceneObject
          __component="mesh"
          __meta={{
            column: 1,
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
        <SceneObject
          __component="group"
          __meta={{
            column: 1,
            line: 1,
            name: "group-1",
            path: "",
            rotate: false,
            scale: false,
            translate: false,
          }}
          ref={ref1}
        >
          <SceneObject
            __component="group"
            __meta={{
              column: 1,
              line: 2,
              name: "group-2",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
            ref={ref2}
          />
          <SceneObject
            __component="group"
            __meta={{
              column: 1,
              line: 3,
              name: "group-3",
              path: "",
              rotate: false,
              scale: false,
              translate: false,
            }}
            ref={ref3}
          />
        </SceneObject>
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
        <SceneObject
          __component="mesh"
          __meta={{
            column: 1,
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
        <SceneObject
          __component={Component}
          __meta={{
            column: 1,
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
      resolveObject3DMeta(ref.current!, {
        elements: [{ column: 1, line: 1 }],
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
                rotate: false,
                scale: false,
                translate: false,
              }}
              attach="shadow-camera"
            />
          </SceneObject>
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
        <SceneObject
          __component="mesh"
          __meta={{
            column: 1,
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
        </SceneObject>
      );
    }
    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneObject
          __component={Fragment}
          __meta={{
            column: 1,
            line: 1,
            name: "ComponentA",
            path: "/bar",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneObject
            __component={Component}
            __meta={{
              column: 1,
              line: 2,
              name: "ComponentB",
              path: "/foo",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </SceneObject>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveObject3DMeta(ref.current!, {
      elements: [{ column: 1, line: 2 }],
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
        <SceneObject
          __component="group"
          __meta={{
            column: 1,
            line: 1,
            name: "group",
            path: "/foo",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneObject
            __component="mesh"
            __meta={{
              column: 1,
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
          </SceneObject>
        </SceneObject>
      );
    }
    await render(
      <SceneObjectContext.Provider value={true}>
        <SceneObject
          __component={Fragment}
          __meta={{
            column: 1,
            line: 1,
            name: "ComponentA",
            path: "/bar",
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneObject
            __component={Component}
            __meta={{
              column: 1,
              line: 2,
              name: "ComponentB",
              path: "/foo",
              rotate: false,
              scale: false,
              translate: false,
            }}
          />
        </SceneObject>
      </SceneObjectContext.Provider>,
    );

    const actual = resolveObject3DMeta(ref.current!, {
      elements: [{ column: 1, line: 2 }],
      path: "/foo",
    });

    expect(actual).toMatchObject({
      column: 1,
      line: 2,
      name: "ComponentB",
    });
  });

  it("should find host scene object using meta", async () => {
    const { scene } = await render(nested());

    const actual = findObject3D(scene.instance, {
      column: 22,
      line: 1,
      path: "/foo",
    });
    const meta = getTriplexMeta(actual);

    expect(meta).toMatchObject({ path: "/foo" });
  });

  it("should find custom component highest scene object using meta", async () => {
    const { scene } = await render(nested());

    const actual = findObject3D(scene.instance, {
      column: 10,
      line: 20,
      path: "/bar",
    });
    const meta = getTriplexMeta(actual);

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
        <SceneObject
          __component={MapControls}
          __meta={{
            column: 1,
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
        <SceneObject
          __component={MapControls}
          __meta={{
            column: 1,
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
