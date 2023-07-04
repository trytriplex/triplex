/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useSubscriptionEffect } from "@triplex/ws-client";
import { type Mock, vi } from "vitest";

vi.mock("@triplex/ws-client", () => {
  return {
    useSubscriptionEffect: vi.fn(),
    preloadSubscription: vi.fn(),
  };
});

export const useSubscriptionEffectMock = useSubscriptionEffect as Mock;

export const mockUseSubscriptionEffect = (path: string, data: unknown) => {
  useSubscriptionEffectMock.mockImplementation((slice: string) => {
    if (slice === path) {
      return data;
    }
    return null;
  });
};
