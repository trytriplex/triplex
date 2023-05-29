// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "react-three-test";
import { MemoryRouter } from "react-router-dom";
import { mockUseSubscriptionEffect } from "./utils/subscriptions";
import { Selection } from "../selection";
import { SceneObject } from "../scene-object";
import { ComponentProvider } from "../context";
import { CustomBoxGroup } from "./__stubs__/custom";

describe("selection", () => {
  it("should select a direct node", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      `/scene/${encodeURIComponent(path)}/${exportName}`,
      {
        sceneObjects: [
          {
            name: "mesh",
            column: 0,
            line: 1,
            type: "host",
            children: [],
          },
        ],
      }
    );
    const { fireEvent, scene } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <Selection
            exportName={exportName}
            path={path}
            onBlur={vi.fn()}
            onJumpTo={vi.fn()}
            onFocus={onFocus}
            onNavigate={vi.fn()}
          >
            <SceneObject
              __meta={{
                name: "mesh",
                path,
                column: 0,
                line: 1,
                rotate: true,
                scale: true,
                translate: true,
              }}
              __component="mesh"
            >
              <boxGeometry />
            </SceneObject>
          </Selection>
        </ComponentProvider>
      </MemoryRouter>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const meshElement = scene.findByType("Mesh");

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: meshElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0].sceneObject).toBe(meshElement.instance);
  });

  it("should select the child mesh when the parent group has no assigned transform", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      `/scene/${encodeURIComponent(path)}/${exportName}`,
      {
        sceneObjects: [
          {
            name: "group",
            column: 0,
            line: 1,
            type: "host",
            children: [
              {
                name: "mesh",
                column: 0,
                line: 2,
                type: "host",
                children: [],
              },
            ],
          },
        ],
      }
    );
    const { fireEvent, scene } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <Selection
            exportName={exportName}
            path={path}
            onBlur={vi.fn()}
            onJumpTo={vi.fn()}
            onFocus={onFocus}
            onNavigate={vi.fn()}
          >
            <SceneObject
              name="parent-group"
              __meta={{
                name: "group",
                path,
                column: 0,
                line: 1,
                rotate: true,
                scale: true,
                translate: true,
              }}
              __component="group"
            >
              <SceneObject
                name="child-mesh"
                __meta={{
                  name: "mesh",
                  path,
                  column: 0,
                  line: 2,
                  rotate: true,
                  scale: true,
                  translate: true,
                }}
                __component="mesh"
              >
                <boxGeometry />
              </SceneObject>
            </SceneObject>
          </Selection>
        </ComponentProvider>
      </MemoryRouter>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const groupElement = scene.findByProps({ name: "parent-group" });
    const meshElement = scene.findByProps({ name: "child-mesh" });

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: groupElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0].sceneObject).toBe(meshElement.instance);
  });

  it("should select the parent group when the it has an assigned transform", async () => {
    const onFocus = vi.fn();
    const path = "box.tsx";
    const exportName = "default";
    mockUseSubscriptionEffect(
      `/scene/${encodeURIComponent(path)}/${exportName}`,
      {
        sceneObjects: [
          {
            name: "group",
            column: 0,
            line: 1,
            type: "host",
            children: [
              {
                name: "mesh",
                column: 0,
                line: 2,
                type: "host",
                children: [],
              },
            ],
          },
        ],
      }
    );

    const { fireEvent, scene } = await render(
      <MemoryRouter>
        <ComponentProvider value={{}}>
          <Selection
            exportName={exportName}
            path={path}
            onBlur={vi.fn()}
            onJumpTo={vi.fn()}
            onFocus={onFocus}
            onNavigate={vi.fn()}
          >
            <SceneObject
              name="custom-box"
              position={[1, 1, 1]}
              __meta={{
                name: "group",
                path: "box.tsx",
                column: 0,
                line: 1,
                rotate: false,
                scale: false,
                translate: true,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              __component={CustomBoxGroup as any}
            />
          </Selection>
        </ComponentProvider>
      </MemoryRouter>
    );
    const selectionGroup = scene.findByProps({ name: "selection-group" });
    const groupElement = scene.findByProps({ name: "custom-box-group" });
    const meshElement = scene.findByProps({ name: "custom-box-mesh" });

    await fireEvent(selectionGroup, "onClick", {
      delta: 0,
      object: meshElement.instance,
    });

    expect(onFocus.mock.calls.length).toEqual(1);
    expect(onFocus.mock.calls[0][0].sceneObject.name).toEqual(
      groupElement.instance.name
    );
  });
});
