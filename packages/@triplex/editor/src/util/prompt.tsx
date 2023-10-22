/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export async function showSaveDialog(filename: string) {
  if (__TRIPLEX_TARGET__ === "electron") {
    return window.triplex.showSaveDialog(filename);
  }

  return prompt("Filename") || undefined;
}
