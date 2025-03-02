/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { type ProviderModule } from "@triplex/bridge/client";
import { send } from "@triplex/bridge/host";
import { describe, expect, it } from "vitest";
import { App } from "../index";

function Scene() {
  return <div>hello</div>;
}

Scene.triplexMeta = {
  lighting: "default",
  root: "react",
} as const;

const providers: ProviderModule = {
  CanvasProvider({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  GlobalProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
};

describe("renderer app", () => {
  it("should start a transition when switching components to prevent state loss", async () => {
    render(
      <App
        files={{
          "/bar": () => Promise.resolve({ Scene }),
          "/foo": () => new Promise(() => {}),
        }}
        providerPath=""
        providers={providers}
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
