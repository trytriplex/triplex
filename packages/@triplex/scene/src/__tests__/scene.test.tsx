/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { MemoryRouter } from "react-router-dom";
import { render } from "react-three-test";
import { Color } from "three";
import { describe, expect, it, vi } from "vitest";
import { SceneProvider } from "../context";
import { Environment } from "../environment";
import { SceneFrame } from "../scene";

vi.mock("@react-three/fiber", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("@react-three/fiber")),
  Canvas: function Canvas({ children }: { children: React.ReactNode }) {
    return <group>{children}</group>;
  },
}));

export default function Provider({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <color args={["#87ceeb"]} attach="background" />
      {children}
    </>
  );
}

describe("scene frame", () => {
  it("should apply color to canvas background", async () => {
    const { getInstance } = await render(
      <MemoryRouter
        initialEntries={[
          {
            search: `?env=${encodeURIComponent(
              JSON.stringify({ config: {} })
            )}`,
          },
        ]}
      >
        <SceneProvider value={{}}>
          <Environment>
            <SceneFrame provider={Provider} />
          </Environment>
        </SceneProvider>
      </MemoryRouter>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const color: Color = (getInstance() as any).background;

    expect(color.getHexString()).toEqual("87ceeb");
  });
});
