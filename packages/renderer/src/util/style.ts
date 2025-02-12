/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type CSSProperties } from "react";

/** Style merge. Merges multiple CSS properties into one. */
function sm(...styles: (CSSProperties | boolean)[]): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

export function style<TStyles extends Record<string, CSSProperties>>(
  styles: TStyles,
): TStyles {
  return styles;
}

style.merge = sm;
