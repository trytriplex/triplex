/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Prop } from "@triplex/server";

export function resolveDefaultValue<TKind extends Prop["kind"]>(
  prop: Prop,
  kind: TKind,
): TKind extends "string"
  ? string
  : TKind extends "number"
    ? number
    : TKind extends "boolean"
      ? boolean
      : unknown {
  const defaultValue = "defaultValue" in prop ? prop.defaultValue : undefined;
  if (!defaultValue) {
    return undefined as never;
  }

  if (kind === "string" && defaultValue.kind === kind) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return defaultValue.value as any;
  }

  if (kind === "number" && defaultValue.kind === kind) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return defaultValue.value as any;
  }

  if (kind === "boolean" && defaultValue.kind === kind) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return defaultValue.value as any;
  }

  return undefined as never;
}
