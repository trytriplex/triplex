/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Statsig from "statsig-js";

let initialized = false;

export async function initFeatureGates({ userId }: { userId: string }) {
  if (!userId) {
    throw new Error("invariant: missing userId");
  }

  if (initialized) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("Statsig already initialized, skipping.");
    }
    return;
  }

  initialized = true;

  await Statsig.initialize(
    "client-RoO8UZOrk5aM4zXe3AP7vQjy66PWeumvN2PfQ2P6xt7",
    { userID: userId },
    {
      environment: {
        tier:
          process.env.NODE_ENV === "production" ? "production" : "development",
      },
    },
  );
}

export function fg(key: string): boolean {
  if (!initialized) {
    throw new Error("invariant: call initFeatureGates first");
  }

  return Statsig.getFeatureGate(key).value;
}
