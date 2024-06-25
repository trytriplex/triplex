/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { dialog, type BrowserWindow } from "electron";

export async function createPkgManagerDialog(
  window: BrowserWindow,
  { detail, message }: { detail: string; message: string },
) {
  const result = await dialog.showMessageBox(window, {
    buttons: ["npm", "yarn", "pnpm", "Cancel"],
    detail,
    message,
    type: "question",
  });

  switch (result.response) {
    case 0:
      return "npm";

    case 1:
      return "yarn";

    case 2:
      return "pnpm";

    default:
      return false;
  }
}
