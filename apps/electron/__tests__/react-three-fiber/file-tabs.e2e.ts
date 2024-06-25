/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("focus on the initial open tab", async ({ editorR3F }) => {
  await expect(editorR3F.fileTabs.activeTab).toHaveText("scene.tsx");
});

test("opening a new file should focus on new tab", async ({ editorR3F }) => {
  await editorR3F.newFile();

  await expect(editorR3F.fileTabs.activeTab).toHaveText("untitled.tsx");
});

test("opening another file", async ({ editorR3F }) => {
  await editorR3F.waitForScene();
  await editorR3F.openFileButton.click();

  await editorR3F.fileDrawer.thumbnail("Box").click();

  await expect(editorR3F.scenePanel.heading).toHaveText("Box");
});

test("fallback to first available tab when closing active tab", async ({
  editorR3F,
}) => {
  await editorR3F.newFile();
  await editorR3F.newFile();
  await editorR3F.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = editorR3F.fileTabs.tab("untitled1.tsx");
  await closeButton.click();

  await expect(editorR3F.fileTabs.activeTab).toHaveText("scene.tsx");
});

test("fallback to last active tab when closing active tab", async ({
  editorR3F,
}) => {
  await editorR3F.newFile();
  await editorR3F.newFile();
  await editorR3F.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton, locator } = editorR3F.fileTabs.tab("untitled.tsx");
  await locator.click();
  await closeButton.click();

  await expect(editorR3F.fileTabs.activeTab).toHaveText("untitled1.tsx");
});

test("do nothing when closing inactive tab", async ({ editorR3F }) => {
  await editorR3F.newFile();
  await editorR3F.newFile();
  await editorR3F.fileTabs.waitForActiveTab("untitled1.tsx");

  const { closeButton } = editorR3F.fileTabs.tab("untitled.tsx");
  await closeButton.click();

  await expect(editorR3F.fileTabs.activeTab).toHaveText("untitled1.tsx");
});

test("reopen tab", async ({ editorR3F }) => {
  await editorR3F.newFile();
  await editorR3F.newFile();
  await editorR3F.fileTabs.waitForActiveTab("untitled1.tsx");
  const { closeButton } = editorR3F.fileTabs.tab("scene.tsx");
  await closeButton.click();

  await editorR3F.fileTabs.openLastTabButton.click();

  await expect(editorR3F.fileTabs.activeTab).toHaveText("scene.tsx");
  await expect(editorR3F.fileTabs.locator).toHaveText(
    // scene.tsx should be first!
    "scene.tsxuntitled.tsxuntitled1.tsx",
  );
});

test("persist previously opened component when switching back to the tab", async ({
  editorR3F,
}) => {
  await editorR3F.switchToComponent("Plane");
  await editorR3F.newFile();

  await editorR3F.fileTabs.tab("scene.tsx").locator.click();

  await expect(editorR3F.scenePanel.heading).toHaveText("Plane");
});
