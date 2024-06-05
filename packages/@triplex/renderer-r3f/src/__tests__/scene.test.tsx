/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { render } from "react-three-test";
import { type Color } from "three";
import { describe, expect, it, vi } from "vitest";
import { SceneProvider } from "../context";
import { SceneFrame } from "../scene";

vi.mock("@react-three/fiber", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("@react-three/fiber")),
  Canvas: function Canvas({ children }: { children: React.ReactNode }) {
    return <group>{children}</group>;
  },
}));

vi.mock("@triplex/ws/react");

window.triplex = { env: { ports: {} }, renderer: { attributes: {} } };

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
    const { getInstance } = await render(
      <SceneProvider value={{}}>
        <SceneFrame provider={Provider} providerPath="" />
      </SceneProvider>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const color: Color = (getInstance() as any).background;
    expect(color.getHexString()).toEqual("87ceeb");
  });

  it("should apply color to canvas background set in local component", async () => {
    function Scene() {
      return <color args={["#ffffff"]} attach="background" />;
    }
    const { act, getInstance } = await render(
      <SceneProvider value={{ "/foo": () => Promise.resolve({ Scene }) }}>
        <SceneFrame
          provider={({ children }) => <>{children}</>}
          providerPath=""
        />
      </SceneProvider>
    );

    await act(() =>
      send(
        "request-open-component",
        {
          encodedProps: "",
          exportName: "Scene",
          path: "/foo",
        },
        true
      )
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const color: Color = (getInstance() as any).background;
    expect(color.getHexString()).toEqual("ffffff");
  });
});
