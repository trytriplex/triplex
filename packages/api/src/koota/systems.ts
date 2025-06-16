/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ECSSystem, type ECSSystemUntagged } from "./types";

export function createSystem<
  TName extends string = never,
  TDevOnly extends boolean = false,
>(
  ...args:
    | [system: ECSSystemUntagged, name: TName | { dev?: TDevOnly; name: TName }]
    | [system: ECSSystemUntagged]
): ECSSystem & { dev?: TDevOnly; systemName?: TName } {
  const system = args[0] as ECSSystem & {
    dev?: TDevOnly;
    systemName: TName;
  };

  if (args.length === 1) {
    return system;
  }

  const { dev, name } =
    typeof args[1] === "string" ? { dev: undefined, name: args[1] } : args[1];
  system.systemName = name;
  system.dev = dev;
  return system;
}
