/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
