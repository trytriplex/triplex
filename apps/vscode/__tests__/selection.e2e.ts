/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("focusing an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();

  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await expect(
    editor.panels.getByRole("button", { name: "ambientLight selected" }),
  ).toBeVisible();
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/lights.tsx",
  });

  test("focusing a light", async ({ vsce }) => {
    await vsce.codelens("PointLight").click();
    const { panels, scene, togglePanelsButton } = vsce.resolveEditor();

    await scene.click();
    await togglePanelsButton.click();

    await expect(
      panels.getByRole("button", { name: "pointLight selected" }),
    ).toBeVisible();
  });
});

test("blurring an element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();
  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await vsce.page.keyboard.press("Escape");

  await expect(
    editor.panels.getByRole("button", { exact: true, name: "ambientLight" }),
  ).toBeVisible();
});

test("default component switcher to initially opened component", async ({
  vsce,
}) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();

  await editor.togglePanelsButton.click();

  await expect(editor.panels.getByTestId("ElementSelect")).toHaveValue("Scene");
});

test("jump to element", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();
  await editor.panels.getByRole("button", { name: "ambientLight" }).click();

  await vsce.page.keyboard.press("f");

  await expect(editor.devOnlyCameraPanel).toHaveText(/pos: 2\.12,0,-0\.88/);
});

test("duplicating an element should be selected", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const editor = vsce.resolveEditor();
  await editor.togglePanelsButton.click();
  await editor.panels.getByRole("button", { exact: true, name: "Box" }).click();

  await vsce.page.keyboard.press("ControlOrMeta+D");

  const secondBoxElement = editor.panels
    .getByRole("button", { name: "Box" })
    .nth(1);
  await expect(secondBoxElement).toHaveAccessibleName(/selected/);
});

test.describe("react dom", () => {
  test.use({
    filename: "examples/test-fixture/src/component-roots.tsx",
  });

  test("selecting a host element", async ({ vsce }) => {
    await vsce.codelens("ReactRoot").click();
    const { panels, scene, togglePanelsButton } = await vsce.resolveEditor();
    await togglePanelsButton.click();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "div" }),
    ).toHaveAccessibleName(/selected/);
    await expect(
      scene.locator.getByTestId("Selected(div@15:10)"),
    ).toBeVisible();
  });

  test("selecting a custom component", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { panels, scene, togglePanelsButton } = await vsce.resolveEditor();
    await togglePanelsButton.click();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "Button" }),
    ).toHaveAccessibleName(/selected/);
    await expect(
      scene.locator.getByTestId("Selected(button@17:5)"),
    ).toBeVisible();
  });

  test("hovering over a component", async ({ vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();
    const { scene, togglePanelsButton } = await vsce.resolveEditor();
    await togglePanelsButton.click();

    await scene.hover();

    await expect(
      scene.locator.getByTestId("Hovered(button@17:5)"),
    ).toBeVisible();
  });
});

test.describe(() => {
  test.use({
    filename: "examples/test-fixture/src/selection-edge-case.tsx",
  });

  test("selecting a host element inside a child custom component where both are rendered by the same component", async ({
    vsce,
  }) => {
    await vsce.codelens("UnknownCustomComponentResolvedHostElements").click();
    const { panels, scene, togglePanelsButton } = await vsce.resolveEditor();
    await togglePanelsButton.click();

    await scene.click();

    await expect(
      panels.getByRole("button", { name: "mesh" }),
    ).toHaveAccessibleName(/selected/);
  });
});
