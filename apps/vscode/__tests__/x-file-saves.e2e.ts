/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("updating component from another file", async ({ snapshot, vsce }) => {
  await vsce.codelens("Scene").click();
  await expect(vsce.loadedComponent).toHaveText("Scene");
  const { panels, togglePanelsButton } = vsce.resolveEditor();
  await togglePanelsButton.click();

  // Focus the child element that lives in another file.
  await panels.getByRole("button", { name: "Show Children" }).click();
  await panels.getByRole("button", { name: "hello-world (mesh)" }).click();

  // Update one of the props of said element.
  const input = panels.getByLabel("scale");
  await input.fill("0.5");
  await input.press("Enter");
  await expect(input).toHaveValue("0.5");
  await expect(vsce.page.getByLabel("scene.tsx, Editor Group 2")).toHaveClass(
    /dirty/,
  );

  // Persist the changes to the file system.
  await vsce.page.keyboard.press("ControlOrMeta+S");
  await expect(
    vsce.page.getByLabel("scene.tsx, Editor Group 2"),
  ).not.toHaveClass(/dirty/);

  // Assert the expected changes were persisted.
  expect(snapshot("examples/test-fixture/src/geometry/box.tsx")).toContain(
    "scale={0.5}",
  );
});
