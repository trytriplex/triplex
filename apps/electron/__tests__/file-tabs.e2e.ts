/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("opening a new file should focus on new tab", async ({ editor }) => {
  await editor.newFile();

  await expect(editor.fileTabs.activeTab).toHaveText("untitled.tsx");
});

test("fallback to first available tab when closing active tab", async ({
  editor,
}) => {
  await editor.newFile();
  await editor.newFile();
  await editor.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = editor.fileTabs.tab("untitled1.tsx");
  await closeButton.click();

  await expect(editor.fileTabs.activeTab).toHaveText("scene.tsx");
});

test("fallback to last active tab when closing active tab", async ({
  editor,
}) => {
  await editor.newFile();
  await editor.newFile();
  await editor.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton, locator } = editor.fileTabs.tab("untitled.tsx");
  await locator.click();
  await closeButton.click();

  await expect(editor.fileTabs.activeTab).toHaveText("untitled1.tsx");
});

test("do nothing when closing inactive tab", async ({ editor }) => {
  await editor.newFile();
  await editor.newFile();
  await editor.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = editor.fileTabs.tab("untitled.tsx");
  await closeButton.click();

  await expect(editor.fileTabs.activeTab).toHaveText("untitled1.tsx");
});
