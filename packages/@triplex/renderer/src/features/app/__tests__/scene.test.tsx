/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { overrideFg } from "@triplex/lib/fg";
import { render } from "react-three-test";
import { type Color } from "three";
import { describe, expect, it, vi } from "vitest";
import { SceneLoader } from "../../scene-loader";

vi.mock("@react-three/fiber", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("@react-three/fiber")),
  Canvas: function Canvas({ children }: { children: React.ReactNode }) {
    return <group>{children}</group>;
  },
}));

vi.mock("@triplex/ws/react");

vi.mock("../../../components/tunnel", () => ({
  Tunnel: { In: () => null, Out: () => null },
}));

vi.mock("../../selection-three-fiber/selection-indicator.tsx", () => ({
  SelectionIndicator: () => null,
}));

window.triplex = { env: { ports: {} } };

function Provider({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <color args={["#87ceeb"]} attach="background" />
      {children}
    </>
  );
}

describe("scene frame", () => {
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
        provider={Provider}
        providerPath=""
        sceneProps={{}}
      />,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const color: Color = (getInstance() as any).background;
    expect(color.getHexString()).toEqual("87ceeb");
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
        provider={({ children }) => <>{children}</>}
        providerPath=""
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const color: Color = (getInstance() as any).background;
    expect(color.getHexString()).toEqual("ffffff");
  });
});
