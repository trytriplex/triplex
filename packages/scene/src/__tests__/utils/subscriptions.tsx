/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useSubscriptionEffect, buildPath } from "@triplex/ws-client";
import type { TWSRouteDefinition } from "@triplex/server";
import { type Mock, vi } from "vitest";

vi.mock("@triplex/ws-client", async () => {
  const client = (await vi.importActual(
    "@triplex/ws-client"
  )) as typeof import("@triplex/ws-client");

  return {
    ...client,
    useSubscriptionEffect: vi.fn(),
  };
});

export const useSubscriptionEffectMock = useSubscriptionEffect as Mock;

export function mockUseSubscriptionEffect<
  TRoute extends keyof TWSRouteDefinition
>(
  path: TRoute,
  params: TWSRouteDefinition[TRoute]["params"],
  data: Partial<TWSRouteDefinition[TRoute]["data"]>
) {
  useSubscriptionEffectMock.mockImplementation(
    (slice: string, sliceData: Record<string, string>) => {
      if (buildPath(slice, sliceData) === buildPath(path, params)) {
        return data;
      }
      return null;
    }
  );
}
