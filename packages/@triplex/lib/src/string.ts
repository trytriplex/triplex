/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type CSSProperties } from "react";

export function toJSONString(value: unknown): string {
  const str = JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );

  return str.replaceAll('"__UNDEFINED__"', "undefined");
}

export function kebabCase(str: string): string {
  return str.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function style(styles: CSSProperties): string {
  return Object.entries(styles).reduce((acc, [key, value]) => {
    return `${acc}${kebabCase(key)}:${value};`;
  }, "");
}
