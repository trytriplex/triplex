/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference types="vite/client" />
import { type ReactNode } from "react";
import Statsig from "statsig-js";

let initialized = false;

/** Overrides set for test environments. This can't be set for production builds. */
const fgOverrides = JSON.parse(import.meta.env.VITE_FG_OVERRIDES || "{}");

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

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-fg-user", userId);
    document.documentElement.setAttribute("data-fg-env", environment);
  }
}

export function fg(key: string): boolean {
  if (fgOverrides[key] !== undefined) {
    return !!fgOverrides[key];
  }

  return Statsig.checkGate(key);
}

export function overrideFg(key: string, value: boolean) {
  Statsig.overrideGate(key, value);
}

export function clearFgOverrides() {
  Statsig.removeGateOverride();
}

export function fgComponent<
  TProps extends object,
  TComponent extends (props: TProps) => ReactNode,
>(
  key: string,
  {
    off: OffComponent,
    on: OnComponent,
  }: {
    off: (props: TProps) => ReactNode;
    on: (props: TProps) => ReactNode;
  },
): TComponent {
  return function GatedComponent(props: TProps) {
    return fg(key) ? <OnComponent {...props} /> : <OffComponent {...props} />;
  } as TComponent;
}
