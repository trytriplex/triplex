/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { send } from "@triplex/bridge/host";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundaryForScene } from "../error-boundary";

function ThrowsError(): string {
  throw new Error("error");
}

describe("error boundary for scene", () => {
  it("should increment when active", async () => {
    const callback = vi.fn();
    render(
      <ErrorBoundaryForScene
        fallbackRender={() => null}
        onResetKeysChange={callback}
      >
        <ThrowsError />
      </ErrorBoundaryForScene>,
    );

    await send("request-refresh-scene", undefined);
    await send("self:request-reset-error-boundary", undefined);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("should not increment when inactive", () => {
    const callback = vi.fn();
    render(
      <ErrorBoundaryForScene
        fallbackRender={() => null}
        onResetKeysChange={callback}
      >
        <div />
      </ErrorBoundaryForScene>,
    );

    send("request-refresh-scene", undefined);
    send("self:request-reset-error-boundary", undefined);

    expect(callback).toHaveBeenCalledTimes(0);
  });
});
