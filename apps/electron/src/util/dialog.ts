/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, dialog } from "electron";

export async function createPkgManagerDialog(
  window: BrowserWindow,
  { message, detail }: { message: string; detail: string }
) {
  const result = await dialog.showMessageBox(window, {
    message,
    detail,
    type: "question",
    buttons: ["npm", "yarn", "pnpm", "Cancel"],
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
