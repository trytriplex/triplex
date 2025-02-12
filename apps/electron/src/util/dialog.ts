/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { templates } from "create-triplex-project";
import { dialog, type BrowserWindow } from "electron";
import { toSentenceCase } from "./string";

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

export async function showTemplateSelectionDialog(
  window: BrowserWindow,
): Promise<string | false> {
  const result = await dialog.showMessageBox(window, {
    buttons: templates.map(toSentenceCase).concat("Cancel"),
    message: "Which template would you like to use?",
    type: "question",
  });

  return templates[result.response] ?? false;
}
