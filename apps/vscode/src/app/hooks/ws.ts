/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createWSHooks } from "@triplex/ws/factory";

const instance = createWSHooks({ url: "ws://localhost:333" });

export const preloadSubscription = instance.preloadSubscription;

export const useLazySubscription = instance.useLazySubscription;

export const useSubscription = instance.useSubscription;

export const useSubscriptionEffect = instance.useSubscriptionEffect;
