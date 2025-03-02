/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { waitFor } from "@testing-library/react";
import { type ProviderModule } from "@triplex/bridge/client";
import { send } from "@triplex/bridge/host";
import { overrideFg } from "@triplex/lib/fg";
import { createElement, forwardRef, useState } from "react";
import { render } from "react-three-test";
import { type Color } from "three";
import { describe, expect, it, vi } from "vitest";
import { SceneLoader } from "../index";

vi.mock("triplex-drei", () => ({
  // eslint-disable-next-line react/display-name
  CameraControls: forwardRef((props, ref) => {
    const [instance] = useState(() => ({ mouseButtons: {}, touches: {} }));

    // eslint-disable-next-line react-compiler/react-compiler
    return createElement("group", {
      ...props,
      name: "__stub_camera_controls__",
      ref: () => {
        if (typeof ref === "object" && ref && !ref.current) {
          ref.current = instance;
        } else if (typeof ref === "function") {
          ref(instance);
        }
      },
    });
  }),
  GizmoHelper: () => createElement("group", { name: "__stub_gizmo_helper__" }),
  GizmoViewcube: () =>
    createElement("mesh", { name: "__stub_gizmo_viewcube__" }),
  Grid: () => null,
  MapControls: () => createElement("mesh", { name: "__stub_map_controls__" }),
}));

vi.mock("@react-three/fiber", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("@react-three/fiber")),
  Canvas: function Canvas({ children }: { children: React.ReactNode }) {
    return <group>{children}</group>;
  },
}));

vi.mock("../../../components/tunnel", () => ({
  Tunnel: { In: () => null, Out: () => null },
}));

vi.mock("../../selection-three-fiber/selection-indicator.tsx", () => ({
  SelectionIndicator: () => null,
}));

const providers: ProviderModule = {
  CanvasProvider({ children }: { children?: React.ReactNode }) {
    return (
      <>
        <color args={["#87ceeb"]} attach="background" />
        {children}
      </>
    );
  },
  GlobalProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
};

const emptyProviders: ProviderModule = {
  CanvasProvider({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  GlobalProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
};

describe("scene loader component", () => {
  it("should apply color to canvas background set in provider", async () => {
    overrideFg("selection_postprocessing", true);
    function Scene() {
      return <mesh />;
    }
    Scene.triplexMeta = {
      lighting: "default",
      root: "react-three-fiber",
    } as const;
    const { getInstance } = await render(
      <SceneLoader
        exportName="Scene"
        modules={{ "/foo": () => Promise.resolve({ Scene }) }}
        path="/foo"
        providerPath=""
        providers={providers}
        sceneProps={{}}
      />,
    );

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const color: Color = (getInstance() as any).background;
      expect(color.getHexString()).toEqual("87ceeb");
    });
  });

  it("should apply color to canvas background set in local component", async () => {
    function Scene() {
      return <color args={["#ffffff"]} attach="background" />;
    }
    Scene.triplexMeta = {
      lighting: "default",
      root: "react-three-fiber",
    } as const;
    const { act, getInstance } = await render(
      <SceneLoader
        exportName="Scene"
        modules={{ "/foo": () => Promise.resolve({ Scene }) }}
        path="/foo"
        providerPath=""
        providers={emptyProviders}
        sceneProps={{}}
      />,
    );

    await act(() =>
      send(
        "request-open-component",
        {
          encodedProps: "",
          exportName: "Scene",
          path: "/foo",
        },
        true,
      ),
    );

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const color: Color = (getInstance() as any).background;
      expect(color.getHexString()).toEqual("ffffff");
    });
  });
});
