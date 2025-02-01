/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TWSRouteDefinition } from "@triplex/server";
import { createWSHooks } from "@triplex/websocks-client/react";

export const {
  clearQuery,
  preloadSubscription,
  useLazySubscription,
  useSubscription,
  useSubscriptionEffect,
} = createWSHooks<TWSRouteDefinition>({
  url: `ws://localhost:${window.triplex.env.ports.ws}`,
});
