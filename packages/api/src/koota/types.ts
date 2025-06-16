/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type RootState } from "@react-three/fiber";
import { type XRStore } from "@react-three/xr";
import { type World } from "koota";

export interface SystemDebugOptions {
  dev?: boolean;
  systemName?: string;
}

export type ECSSystemControls<T extends SystemDebugOptions[]> = {
  [P in T[number] as P extends { dev?: infer D; systemName?: infer S }
    ? S extends string
      ? D extends true
        ? `run${Capitalize<S>}`
        : `pause${Capitalize<S>}`
      : never
    : never]?: boolean;
};

export type ECSSystemUntagged = (
  world: World,
  delta: number,
  state: RootState,
  store?: XRStore,
) => void;

export type ECSSystem = { [s]: true } & ECSSystemUntagged;

declare const s: unique symbol;
