/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Prop, type ValueKind } from "@triplex/lib/types";

export function resolveDefaultValue<TKind extends ValueKind | "any">(
  prop: Prop,
  kind: TKind,
): TKind extends "string"
  ? string
  : TKind extends "number"
    ? number
    : TKind extends "boolean"
      ? boolean
      : TKind extends "array"
        ? unknown[]
        : TKind extends "any"
          ? string | number | boolean | unknown[]
          : never {
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

  if (kind === "array" && defaultValue.kind === kind) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return defaultValue.value as any;
  }

  if (
    kind === "any" &&
    defaultValue.kind !== "identifier" &&
    defaultValue.kind !== "unhandled"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return defaultValue.value as any;
  }

  return undefined as never;
}
