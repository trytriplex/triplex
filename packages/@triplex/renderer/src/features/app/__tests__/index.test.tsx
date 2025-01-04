/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { send } from "@triplex/bridge/host";
import { describe, expect, it, vi } from "vitest";
import { App } from "../index";

function Scene() {
  return <div>hello</div>;
}

vi.mock("@triplex/ws/react");

Scene.triplexMeta = {
  lighting: "default",
  root: "react",
} as const;

function Provider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

describe("renderer app", () => {
  it("should start a transition when switching components to prevent state loss", async () => {
    render(
      <App
        files={{
          "/bar": () => Promise.resolve({ Scene }),
          "/foo": () => new Promise(() => {}),
        }}
        provider={Provider}
        providerPath=""
      />,
    );
    await send("request-open-component", {
      encodedProps: "",
      exportName: "Scene",
      path: "/bar",
    });

    await act(() =>
      send("request-open-component", {
        encodedProps: "",
        exportName: "Scene",
        path: "/foo",
      }),
    );

    expect(screen.queryByLabelText("Loading")).toBeNull();
  });
});
