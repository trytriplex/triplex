/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/react-roots.tsx",
  });

  test("component with canvas component and sibling HTML", async ({ vsce }) => {
    await vsce.codelens("CanvasExample").click();
    const { scene } = vsce.resolveEditor();

    await expect(
      scene.locator.getByText("HTML CONTENT OUTSIDE CANVAS"),
    ).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/component-roots.tsx",
  });

  test("component with three react root from another module", async ({
    vsce,
  }) => {
    await vsce.codelens("ThreeFiberRootFromAnotherModule").click();

    await expect(vsce.loadedComponent).toHaveText(
      "ThreeFiberRootFromAnotherModule",
    );
  });

  test("component with react root", async ({ vsce }) => {
    await vsce.codelens("ReactRoot").click();
    const { scene } = vsce.resolveEditor();

    await expect(scene.locator.getByTestId("react-root")).toBeVisible();
  });

  test("component with react root from another module", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { scene } = vsce.resolveEditor();

    await expect(scene.locator.getByRole("button")).toBeVisible();
  });
});
