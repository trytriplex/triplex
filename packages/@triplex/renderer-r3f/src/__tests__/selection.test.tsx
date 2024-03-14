/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
// We need the mock to be the first imported one.
// prettier-ignore
import { mockUseSubscriptionEffect } from "./utils/subscriptions";
import { render } from "react-three-test";
import { describe, expect, it, vi } from "vitest";
import { SceneObject } from "../scene-object";
import { Selection } from "../selection";
import { CustomBoxGroup } from "./__stubs__/custom";

describe("selection", () => {
  it("should select a direct host node", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      "/scene/:path/:exportName",
      { exportName, path },
      {
        sceneObjects: [
          {
            children: [],
            column: 0,
            line: 1,
            name: "mesh",
            parentPath: "",
            type: "host",
          },
        ],
      }
    );
    const { fireEvent, scene } = await render(
      <Selection
        filter={{ exportName: "default", path }}
        onBlur={vi.fn()}
        onFocus={onFocus}
        onJumpTo={vi.fn()}
        onNavigate={vi.fn()}
      >
        <SceneObject
          __component="group"
          __meta={{
            column: 0,
            line: 1,
            name: "group",
            path,
            rotate: false,
            scale: false,
            translate: false,
          }}
        >
          <SceneObject
            __component="mesh"
            __meta={{
              column: 0,
              line: 1,
              name: "mesh",
              path,
              rotate: true,
              scale: true,
              translate: true,
            }}
          >
            <boxGeometry />
          </SceneObject>
        </SceneObject>
      </Selection>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const groupElement = scene.findAllByType("Mesh")[0];

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: groupElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0]).toEqual({
      column: 0,
      line: 1,
      parentPath: "box.tsx",
      path: "box.tsx",
    });
  });

  it("should select a direct custom node", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      "/scene/:path/:exportName",
      { exportName, path },
      {
        sceneObjects: [
          {
            children: [],
            column: 22,
            line: 33,
            name: "mesh",
            parentPath: "",
            type: "host",
          },
        ],
      }
    );
    const { fireEvent, scene } = await render(
      <Selection
        filter={{ exportName: "default", path }}
        onBlur={vi.fn()}
        onFocus={onFocus}
        onJumpTo={vi.fn()}
        onNavigate={vi.fn()}
      >
        <SceneObject
          __component="mesh"
          __meta={{
            column: 22,
            line: 33,
            name: "Mesh",
            path,
            rotate: true,
            scale: true,
            translate: true,
          }}
        >
          <boxGeometry />
        </SceneObject>
      </Selection>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const meshElement = scene.findByType("Mesh");

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: meshElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0]).toEqual({
      column: 22,
      line: 33,
      parentPath: "box.tsx",
      path: "box.tsx",
    });
  });

  it("should select the child mesh when the parent group has no assigned transform", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      "/scene/:path/:exportName",
      { exportName, path },
      {
        sceneObjects: [
          {
            children: [
              {
                children: [],
                column: 0,
                line: 2,
                name: "mesh",
                parentPath: "",
                type: "host",
              },
            ],
            column: 0,
            line: 1,
            name: "group",
            parentPath: "",
            type: "host",
          },
        ],
      }
    );
    const { fireEvent, scene } = await render(
      <Selection
        filter={{ exportName: "default", path }}
        onBlur={vi.fn()}
        onFocus={onFocus}
        onJumpTo={vi.fn()}
        onNavigate={vi.fn()}
      >
        <SceneObject
          __component="group"
          __meta={{
            column: 0,
            line: 1,
            name: "Box",
            path,
            rotate: true,
            scale: true,
            translate: true,
          }}
          name="parent-group"
        >
          <SceneObject
            __component="mesh"
            __meta={{
              column: 0,
              line: 2,
              name: "mesh",
              path,
              rotate: true,
              scale: true,
              translate: true,
            }}
            name="child-mesh"
          >
            <boxGeometry />
          </SceneObject>
        </SceneObject>
      </Selection>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const groupElement = scene.findByProps({ name: "parent-group" });

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: groupElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0]).toEqual({
      column: 0,
      line: 1,
      parentPath: "box.tsx",
      path: "box.tsx",
    });
  });

  it("should select the parent group when the it has an assigned transform", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      "/scene/:path/:exportName",
      { exportName, path },
      {
        sceneObjects: [
          {
            children: [
              {
                children: [],
                column: 0,
                line: 2,
                name: "mesh",
                parentPath: "",
                type: "host",
              },
            ],
            column: 11,
            line: 22,
            name: "group",
            parentPath: "",
            type: "host",
          },
        ],
      }
    );

    const { fireEvent, scene } = await render(
      <Selection
        filter={{ exportName: "default", path }}
        onBlur={vi.fn()}
        onFocus={onFocus}
        onJumpTo={vi.fn()}
        onNavigate={vi.fn()}
      >
        <SceneObject
          __component={CustomBoxGroup}
          __meta={{
            column: 11,
            line: 22,
            name: "CustomBoxGroup",
            path: "box.tsx",
            rotate: false,
            scale: false,
            translate: true,
          }}
          name="custom-box"
          position={[1, 1, 1]}
        />
      </Selection>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const meshElement = scene.findByProps({ name: "custom-box-mesh" });

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: meshElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0]).toEqual({
      column: 11,
      line: 22,
      parentPath: "box.tsx",
      path: "box.tsx",
    });
  });
});
