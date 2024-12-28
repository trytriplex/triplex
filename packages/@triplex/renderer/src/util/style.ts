/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { type CSSProperties } from "react";

/** Style merge. Merges multiple CSS properties into one. */
function sm(...styles: CSSProperties[]): CSSProperties {
  return Object.assign({}, ...styles);
}

export function style<TStyles extends Record<string, CSSProperties>>(
  styles: TStyles,
): TStyles {
  return styles;
}

style.merge = sm;
