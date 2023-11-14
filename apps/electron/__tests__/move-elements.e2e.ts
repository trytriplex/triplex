/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("dragging before an element", async ({ editor }) => {
  const source = editor.scenePanel.elementButton("PerspectiveCamera");
  const destination = editor.scenePanel.elementButton("Box");

  await source.locator.dragTo(destination.locator, {
    targetPosition: { x: 1, y: 1 },
  });

  await expect(editor.scenePanel.allElements.nth(1)).toHaveText(
    "PerspectiveCamera"
  );
});

test("dragging after an element", async ({ editor }) => {
  const source = editor.scenePanel.elementButton("ambientLight");
  const destination = editor.scenePanel.elementButton("Box");

  await source.locator.dragTo(destination.locator, {
    targetPosition: { x: 0, y: 25 },
  });

  await expect(editor.scenePanel.allElements.nth(1)).toHaveText("ambientLight");
});

test("drag into an element", async ({ editor }) => {
  const source = editor.scenePanel.elementButton("ambientLight");
  const destination = editor.scenePanel.elementButton("group");

  await source.locator.dragTo(destination.locator);

  await expect(editor.scenePanel.allElements.nth(3)).toHaveText("ambientLight");
});
