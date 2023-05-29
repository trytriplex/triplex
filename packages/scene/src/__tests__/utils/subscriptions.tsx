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
