/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("dragging before an element", async ({ electron }) => {
  const source = electron.scenePanel.elementButton(
    "user_defined (PerspectiveCamera)",
  );
  const destination = electron.scenePanel.elementButton("Box");

  await source.locator.dragTo(destination.locator, {
    targetPosition: { x: 1, y: 1 },
  });

  await expect(electron.scenePanel.allElements.nth(2)).toHaveText(
    "user_defined (PerspectiveCamera)",
  );
});

test("dragging after an element", async ({ electron }) => {
  const source = electron.scenePanel.elementButton("ambientLight");
  const destination = electron.scenePanel.elementButton("Box");

  await source.locator.dragTo(destination.locator, {
    targetPosition: { x: 0, y: 25 },
  });

  await expect(electron.scenePanel.allElements.nth(1)).toHaveText(
    "ambientLight",
  );
});

test("drag into an element", async ({ electron }) => {
  const source = electron.scenePanel.elementButton("ambientLight");
  const destination = electron.scenePanel.elementButton("group");

  await source.locator.dragTo(destination.locator);

  await expect(electron.scenePanel.allElements.nth(4)).toHaveText(
    "ambientLight",
  );
});
