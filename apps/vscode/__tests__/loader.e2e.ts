/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test(
  "opening scene using codelens",
  { tag: "@vsce_smoke" },
  async ({ vsce }) => {
    await vsce.codelens("Scene").click();

    await expect(vsce.loadedComponent).toHaveText("Scene");
  },
);

test(
  "opening with triplex button",
  { tag: "@vsce_smoke" },
  async ({ vsce }) => {
    await vsce.openFileButton.click();

    await expect(vsce.loadedComponent).toHaveText("Plane");
  },
);

test("reopening a file after closing", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  await vsce.editorTab.closeButton.click();

  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");
});

test("opening another scene using codelens", async ({ vsce }) => {
  await vsce.codelens("Scene").click();

  await vsce.codelens("Plane").click();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});

test("quickly closing and then reopening", async ({ vsce }) => {
  await vsce.codelens("Scene", { skipWait: true }).click();

  await vsce.editorTab.closeButton.click({ delay: 100 });
  await vsce.codelens("Scene").click();

  await expect(vsce.loadedComponent).toHaveText("Scene");
});
