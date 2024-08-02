/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/// <reference types="vite/client" />
import Statsig from "statsig-js";

let initialized = false;

export async function initFeatureGates({
  environment = process.env.NODE_ENV === "production"
    ? "production"
    : "development",
  userId,
}: {
  environment?: "production" | "staging" | "development" | "local";
  userId: string;
}) {
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
        tier: environment,
      },
      localMode: environment === "local",
    },
  );
}

export function fg(key: string): boolean {
  return Statsig.getFeatureGate(key).value;
}

export function overrideFg(key: string, value: boolean) {
  Statsig.overrideGate(key, value);
}

export function clearFgOverrides() {
  Statsig.removeGateOverride();
}
