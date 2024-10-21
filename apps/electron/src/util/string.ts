/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function toSentenceCase(str: string): string {
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
    .split("-")
    .join(" ");
}
