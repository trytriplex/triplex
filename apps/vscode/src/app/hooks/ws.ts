/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type TWSRouteDefinition } from "@triplex/server";
import { createWSHooks } from "@triplex/websocks-client/react";

export const {
  clearQuery,
  experimental_useLazySubscriptionStream,
  preloadSubscription,
  useLazySubscription,
  useSubscription,
} = createWSHooks<TWSRouteDefinition>({
  url: `ws://localhost:${window.triplex.env.ports.ws}`,
});
