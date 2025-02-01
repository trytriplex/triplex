/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createWSHooks } from "../react";

type StubRoutes = Record<"/folder", { data: { name: string }; params: never }>;

const { preloadSubscription, useLazySubscription, useSubscription } =
  createWSHooks<StubRoutes>(() => ({
    url: "ws://localhost:3",
  }));

describe("ws hooks", () => {
  it("should throw when using a subscription", () => {
    expect(() => {
      renderHook(() => {
        useSubscription("/folder");
      });
    }).toThrow("call load() first");
  });

  it("should subscribe to data", async () => {
    preloadSubscription("/folder");
    const { result } = renderHook(() => useSubscription("/folder"));

    await waitFor(() => {
      expect(result.current).toEqual({ name: "bar" });
    });
  });

  it("should lazily subscribe data", async () => {
    const { result } = renderHook(() => useLazySubscription("/folder"));

    await waitFor(() => {
      expect(result.current).toEqual({ name: "bar" });
    });
  });

  it("should clean up subscriptions sometime after unmounting", async () => {
    preloadSubscription("/folder");
    const { result, unmount } = renderHook(() => useSubscription("/folder"));
    await waitFor(() => {
      expect(result.current).toEqual({ name: "bar" });
    });

    vi.useFakeTimers();
    unmount();
    vi.runAllTimers();
    // We need to wait for the websocket cleanup to happen.
    await new Promise((resolve) => resolve(undefined));

    expect(() => {
      renderHook(() => useSubscription("/folder"));
    }).not.toThrow();
  });
});
