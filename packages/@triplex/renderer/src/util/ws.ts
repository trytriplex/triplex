/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TWSRouteDefinition } from "@triplex/server";
import { createWSHooks } from "@triplex/websocks/factory";

const instance = createWSHooks<TWSRouteDefinition>({
  url: `ws://localhost:${window.triplex.env.ports.ws}`,
});

export const preloadSubscription = instance.preloadSubscription;

export const useLazySubscription = instance.useLazySubscription;

export const useSubscription = instance.useSubscription;

export const useSubscriptionEffect = instance.useSubscriptionEffect;
