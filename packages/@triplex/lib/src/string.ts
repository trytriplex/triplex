/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
